import api from "../services/api";

interface UserProfile {
    userId: string;
    displayName: string;
    bio: string;
    location: string;
    profilePictureUrl: string;
}

export const getUserProfile = async (): Promise<UserProfile> => {
    try {
        const response = await api.get("/profile");
        if (response.data.data.userProfile) {
            return response.data.data.userProfile;
        } else {
            throw new Error("User profile not found");
        }
    } catch (error) {
        console.error("Erro ao buscar o perfil:", error);
        throw error;
    }
};

export const updateUserProfile = async (data: FormData): Promise<void> => {
    try {
        await api.put("/profile", data, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    } catch (error) {
        console.error("Erro ao atualizar o perfil:", error);
    }
};
