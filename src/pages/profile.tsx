import React, { useEffect, useState } from "react";
import { Button, TextField, Typography, Box, Avatar, IconButton, Divider, Container } from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import Loader from "../components/loader";
import { useUser } from "../contexts/usercontext";

interface UserProfile {
    userId: string;
    displayName: string;
    bio: string;
    location: string;
    profilePictureUrl: string;
}

const ProfilePage: React.FC = () => {
    const { userProfile, updateUserProfile } = useUser();
    const [image, setImage] = useState<File | null>(null);
    const [hover, setHover] = useState(false);
    const [bioLength, setBioLength] = useState(0);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isSaving, setIsSaving] = useState<boolean>(false);

    const { control, handleSubmit, watch, reset } = useForm<UserProfile>({
        defaultValues: {
            displayName: "",
            bio: "",
            location: "",
            profilePictureUrl: "",
        }
    });

    const bio = watch("bio");

    useEffect(() => {
        setBioLength(bio.length);
    }, [bio]);

    useEffect(() => {
        if (userProfile) {
            reset({
                displayName: userProfile.displayName,
                bio: userProfile.bio,
                location: userProfile.location,
                profilePictureUrl: userProfile.profilePictureUrl,
            });
            setIsLoading(false);
        }
    }, [userProfile, reset]);

    const onSubmit = async (data: UserProfile) => {
        if (
            data.displayName === userProfile?.displayName &&
            data.bio === userProfile?.bio &&
            data.location === userProfile?.location &&
            (!image || data.profilePictureUrl === imagePreview)
        ) {
            return;
        }

        const formData = new FormData();
        formData.append("displayName", data.displayName);
        formData.append("bio", data.bio);
        formData.append("location", data.location);

        if (image != null) {
            formData.append("image", image);
        }

        setIsSaving(true);

        try {
            await updateUserProfile(formData);
            setTimeout(() => setIsSaving(false), 2000);
        } catch (error) {
            setIsSaving(false);
        }
    };

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const file = event.target.files[0];
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const isButtonDisabled = () => {
        const displayName = watch("displayName");
        const bio = watch("bio");
        const location = watch("location");
        const profilePictureUrl = watch("profilePictureUrl");

        const hasChanges =
            displayName !== userProfile?.displayName ||
            bio !== userProfile?.bio ||
            location !== userProfile?.location ||
            (image !== null && profilePictureUrl !== imagePreview);

        return !hasChanges;
    };

    return (
        <Container>
            <Divider sx={{ marginTop: 8, borderColor: 'transparent' }} />
            <Typography
                variant="h5"
                sx={{
                    color: '#666',
                    textAlign: { xs: 'center', md: 'left' },
                }}
            >
                seu perfil
            </Typography>

            {isLoading ? (
                <Loader />
            ) : (
                <Box sx={{ maxWidth: 800, margin: "0 auto", padding: 2, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4, alignItems: 'center' }}>
                    <Box
                        sx={{
                            position: 'relative',
                            width: { xs: 150, md: 200 },
                            height: { xs: 150, md: 200 },
                            borderRadius: '50%',
                            overflow: 'hidden',
                            '&:hover .upload-button': {
                                opacity: 1,
                            }
                        }}
                        onMouseEnter={() => setHover(true)}
                        onMouseLeave={() => setHover(false)}
                    >
                        <Avatar
                            src={imagePreview ? imagePreview : userProfile?.profilePictureUrl ? `${userProfile?.profilePictureUrl}?t=${userProfile?.updatedAt}` : '/jamcoredefaultpicture.jpg'}
                            alt="Foto do Perfil"
                            sx={{ width: '100%', height: '100%' }}
                        />
                        {hover && (
                            <Box
                                className="upload-button"
                                sx={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    opacity: 0,
                                    transition: 'opacity 0.3s',
                                }}
                            >
                                <IconButton component="label">
                                    <CloudUploadIcon sx={{ color: 'white' }} />
                                    <input
                                        type="file"
                                        hidden
                                        onChange={handleImageChange}
                                        accept="image/*"
                                    />
                                </IconButton>
                            </Box>
                        )}
                    </Box>

                    <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' } }} />

                    <Box sx={{ flex: 1, width: '100%' }}>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mb: 2 }}>
                                <Controller
                                    name="displayName"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            label="nome de exibição"
                                            fullWidth
                                            margin="normal"
                                            variant="outlined"
                                        />
                                    )}
                                />
                                <Controller
                                    name="location"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            label="localização"
                                            fullWidth
                                            margin="normal"
                                            variant="outlined"
                                        />
                                    )}
                                />
                            </Box>

                            <Controller
                                name="bio"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="biografia"
                                        fullWidth
                                        margin="normal"
                                        variant="outlined"
                                        multiline
                                        rows={4}
                                        inputProps={{ maxLength: 500 }}
                                    />
                                )}
                            />
                            <Typography variant="body2" sx={{ textAlign: 'right', color: 'text.secondary' }}>
                                {bioLength}/500 caracteres
                            </Typography>
                            <Box sx={{ marginTop: 2, display: 'flex', justifyContent: 'flex-end' }}>
                                <Button type="submit" variant="contained" disabled={isSaving || isButtonDisabled()}>
                                    {isSaving ? "salvando..." : "salvar"}
                                </Button>
                            </Box>
                        </form>
                    </Box>
                </Box>
            )}
            <Divider sx={{ marginTop: 8, borderColor: 'transparent' }} />
        </Container>
    );
};

export default ProfilePage;