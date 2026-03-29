import Blob "mo:core/Blob";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Text "mo:core/Text";
import List "mo:core/List";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";

import Storage "blob-storage/Storage";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";
import Stripe "stripe/stripe";
import OutCall "http-outcalls/outcall";
import MixinAuthorization "authorization/MixinAuthorization";


// Apply data migration

actor {
  // Initialize the access control state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Include blob storage
  include MixinStorage();

  // Video template metadata
  public type VideoTemplate = {
    id : Text;
    name : Text;
    category : Text;
    thumbnail : Storage.ExternalBlob;
    preview : Storage.ExternalBlob;
  };

  // User profile definition with quota and premium status
  public type UserProfile = {
    username : Text;
    isPremium : Bool;
    dailyQuota : Nat;
    usedQuota : Nat;
    rewardCredits : Nat;
    photo : Storage.ExternalBlob;
  };

  // Generation history entry definition
  public type GenerationHistoryEntry = {
    timestamp : Int;
    templateId : Text;
    inputPhoto : Storage.ExternalBlob;
    outputVideo : Storage.ExternalBlob;
  };

  // Video template storage
  let templates = Map.empty<Text, VideoTemplate>();

  // User profile storage
  let userProfiles = Map.empty<Principal, UserProfile>();

  // Generation history per user
  let userHistories = Map.empty<Principal, List.List<GenerationHistoryEntry>>();

  // Profile management functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);

    // Initialize history if not exists
    switch (userHistories.get(caller)) {
      case (null) {
        let emptyHistory = List.empty<GenerationHistoryEntry>();
        userHistories.add(caller, emptyHistory);
      };
      case (?_) { /* already exists */ };
    };
  };

  // Create a new video template (admin only)
  public shared ({ caller }) func createVideoTemplate(id : Text, name : Text, category : Text, thumbnail : Storage.ExternalBlob, preview : Storage.ExternalBlob) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create video templates");
    };
    let newTemplate : VideoTemplate = {
      id;
      name;
      category;
      thumbnail;
      preview;
    };
    templates.add(id, newTemplate);
  };

  // Create a new user profile (caller creates their own profile)
  public shared ({ caller }) func createProfile(username : Text, photo : Storage.ExternalBlob) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create profiles");
    };
    let newProfile : UserProfile = {
      username;
      photo;
      isPremium = false;
      dailyQuota = 3;
      usedQuota = 0;
      rewardCredits = 0;
    };

    userProfiles.add(caller, newProfile);
    let emptyHistory = List.empty<GenerationHistoryEntry>();
    userHistories.add(caller, emptyHistory);
  };

  // Update user profile photo (own profile only)
  public shared ({ caller }) func updateProfilePhoto(photo : Storage.ExternalBlob) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update photos");
    };
    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("Profile not found") };
      case (?profile) {
        let updatedProfile = {
          profile with
          photo;
        };
        userProfiles.add(caller, updatedProfile);
      };
    };
  };

  // Add generation history entry (own history only)
  public shared ({ caller }) func addGenerationToFavorites(templateId : Text, inputPhoto : Storage.ExternalBlob, outputVideo : Storage.ExternalBlob) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add generation history");
    };

    let historyEntry : GenerationHistoryEntry = {
      timestamp = Time.now();
      templateId;
      inputPhoto;
      outputVideo;
    };

    switch (userHistories.get(caller)) {
      case (null) {
        Runtime.trap("User has no history! Create a profile first.");
      };
      case (?history) {
        history.add(historyEntry);
      };
    };
  };

  // Add alternative photo (own profile only)
  public shared ({ caller }) func addAlternativePhoto(photo : Storage.ExternalBlob) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add alternative photos");
    };
    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("Profile not found") };
      case (?profile) {
        let updatedProfile = {
          profile with
          photo;
        };
        userProfiles.add(caller, updatedProfile);
      };
    };
  };

  // Fetch video template by identifier (users only)
  public query ({ caller }) func fetchVideoTemplate(templateId : Text) : async ?VideoTemplate {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can fetch video templates");
    };
    templates.get(templateId);
  };

  // Get all templates (users only)
  public query ({ caller }) func getTemplates() : async [VideoTemplate] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can fetch templates");
    };
    templates.values().toArray();
  };

  // Fetch user profile by principal (own profile or admin)
  public query ({ caller }) func fetchUserProfile(profileId : Principal) : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can fetch profiles");
    };
    if (caller != profileId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(profileId);
  };

  // Check if user is premium (own status or admin)
  public query ({ caller }) func hasPremium(user : Principal) : async Bool {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only check your own premium status");
    };
    switch (userProfiles.get(user)) {
      case (null) { false };
      case (?profile) { profile.isPremium };
    };
  };

  // Get user daily quota (own quota or admin)
  public query ({ caller }) func getDailyQuota(user : Principal) : async Nat {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only check your own quota");
    };
    switch (userProfiles.get(user)) {
      case (null) { 0 };
      case (?profile) { profile.dailyQuota };
    };
  };

  // Upgrade user to premium status (own upgrade or admin)
  public shared ({ caller }) func upgradeToPremium(user : Principal) : async () {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only upgrade your own account");
    };
    switch (userProfiles.get(user)) {
      case (null) { Runtime.trap("Profile not found") };
      case (?profile) {
        let updatedProfile = {
          profile with
          isPremium = true;
          dailyQuota = 1000;
        };
        userProfiles.add(user, updatedProfile);
      };
    };
  };

  // Add reward credits (admin only - prevents abuse)
  public shared ({ caller }) func addRewardCredits(user : Principal, credits : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add reward credits");
    };
    switch (userProfiles.get(user)) {
      case (null) { Runtime.trap("User has no profile for adding credits") };
      case (?profile) {
        let updatedProfile = {
          profile with
          rewardCredits = profile.rewardCredits + credits;
        };
        userProfiles.add(user, updatedProfile);
      };
    };
  };

  // Fetch generation history for user (own history or admin)
  public query ({ caller }) func fetchGenerationHistory(user : Principal) : async [GenerationHistoryEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can fetch generation history");
    };
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own generation history");
    };
    switch (userHistories.get(user)) {
      case (null) { [] };
      case (?history) { history.toArray() };
    };
  };

  // Get generation history (own history or admin)
  public query ({ caller }) func getGenerationHistory(user : Principal) : async [GenerationHistoryEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get generation history");
    };
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own generation history");
    };
    switch (userHistories.get(user)) {
      case (null) { [] };
      case (?history) {
        history.toArray();
      };
    };
  };

  // Stripe configuration (admin only)
  var configuration : ?Stripe.StripeConfiguration = null;

  public query func isStripeConfigured() : async Bool {
    configuration != null;
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    configuration := ?config;
  };

  func getStripeConfiguration() : Stripe.StripeConfiguration {
    switch (configuration) {
      case (null) { Runtime.trap("Stripe needs to be first configured") };
      case (?value) { value };
    };
  };

  public func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    await Stripe.getSessionStatus(getStripeConfiguration(), sessionId, transform);
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    await Stripe.createCheckoutSession(getStripeConfiguration(), caller, items, successUrl, cancelUrl, transform);
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };
};
