import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface VideoTemplate {
    id: string;
    thumbnail: ExternalBlob;
    preview: ExternalBlob;
    name: string;
    category: string;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface ShoppingItem {
    productName: string;
    currency: string;
    quantity: bigint;
    priceInCents: bigint;
    productDescription: string;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface GenerationHistoryEntry {
    templateId: string;
    inputPhoto: ExternalBlob;
    outputVideo: ExternalBlob;
    timestamp: bigint;
}
export type StripeSessionStatus = {
    __kind__: "completed";
    completed: {
        userPrincipal?: string;
        response: string;
    };
} | {
    __kind__: "failed";
    failed: {
        error: string;
    };
};
export interface StripeConfiguration {
    allowedCountries: Array<string>;
    secretKey: string;
}
export interface UserProfile {
    username: string;
    isPremium: boolean;
    dailyQuota: bigint;
    usedQuota: bigint;
    photo: ExternalBlob;
    rewardCredits: bigint;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addAlternativePhoto(photo: ExternalBlob): Promise<void>;
    addGenerationToFavorites(templateId: string, inputPhoto: ExternalBlob, outputVideo: ExternalBlob): Promise<void>;
    addRewardCredits(user: Principal, credits: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    createProfile(username: string, photo: ExternalBlob): Promise<void>;
    createVideoTemplate(id: string, name: string, category: string, thumbnail: ExternalBlob, preview: ExternalBlob): Promise<void>;
    fetchGenerationHistory(user: Principal): Promise<Array<GenerationHistoryEntry>>;
    fetchUserProfile(profileId: Principal): Promise<UserProfile | null>;
    fetchVideoTemplate(templateId: string): Promise<VideoTemplate | null>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDailyQuota(user: Principal): Promise<bigint>;
    getGenerationHistory(user: Principal): Promise<Array<GenerationHistoryEntry>>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    getTemplates(): Promise<Array<VideoTemplate>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    hasPremium(user: Principal): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateProfilePhoto(photo: ExternalBlob): Promise<void>;
    upgradeToPremium(user: Principal): Promise<void>;
}
