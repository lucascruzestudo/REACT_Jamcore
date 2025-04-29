import React, { useEffect, useState, useRef } from "react";
import { Button, TextField, Typography, Box, Avatar, IconButton, Divider, Container } from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import Loader from "../components/loader";
import { useUser } from "../contexts/usercontext";
import { useParams } from "react-router-dom";
import api from "../services/api";
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import CompactTrack from "../components/compacttrack";
import UserComments from "../components/usercomments";

interface UserProfile {
    id: string;
    username: string;
    displayName: string;
    bio: string;
    location: string;
    profilePictureUrl: string;
    updatedAt: string;
}

const UserProfilePage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { updateUserProfile, user } = useUser();
    const [image, setImage] = useState<File | null>(null);
    const [hover, setHover] = useState(false);
    const [bioLength, setBioLength] = useState(0);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const loaderRef = useRef(null);

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

    const {
        data: userProfile,
        isLoading: isProfileLoading,
        isError: isProfileError,
        error: profileError,
    } = useQuery<UserProfile, Error>({
        queryKey: ['userProfile', id],
        queryFn: async () => {
            const response = await api.get(`Profile/${id}`);
            return response.data.data.userProfile;
        },
        enabled: !!id,
    });

    const fetchUserTracks = async ({ pageParam = 1 }) => {
        const response = await api.get(`Track/byuser/${id}`, {
            params: {
                pageNumber: pageParam,
                pageSize: 6,
            },
        });
        return response.data.data.tracks;
    };

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading: isTracksLoading,
        isError: isTracksError,
        error: tracksError,
    } = useInfiniteQuery({
        queryKey: ['userTracks', id],
        queryFn: fetchUserTracks,
        getNextPageParam: (lastPage) => {
            return lastPage.hasNextPage ? lastPage.pageNumber + 1 : undefined;
        },
        initialPageParam: 1,
    });

    const tracks = data?.pages.flatMap((page) => page.items) || [];

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

    const isCurrentUser = user?.id === userProfile?.id;

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
                    fetchNextPage();
                }
            },
            { threshold: 1.0 }
        );

        if (loaderRef.current) {
            observer.observe(loaderRef.current);
        }

        return () => {
            if (loaderRef.current) {
                observer.unobserve(loaderRef.current);
            }
        };
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    if (isProfileLoading) {
        return <Loader centered />;
    }

    if (isProfileError) {
        return <Typography variant="h6">Error: {profileError.message}</Typography>;
    }

    if (!userProfile) {
        return <Typography variant="h6">User not found</Typography>;
    }

    return (
        <Container>
            <Divider sx={{ marginTop: 12, borderColor: 'transparent' }} />
            <Typography
                variant="h5"
                sx={{
                    color: '#666',
                    textAlign: { xs: 'center', md: 'left' },
                }}
            >
                {isCurrentUser ? 'seu perfil' : 'perfil'}
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
                        {isCurrentUser && hover && (
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
                        {isCurrentUser ? (
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
                        ) : (
                            <Box>
                                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mb: 2 }}>
                                    <Box sx={{ flex: 1 }}>
                                        <TextField
                                            value={userProfile.displayName || userProfile.username || ' '}
                                            fullWidth
                                            margin="normal"
                                            variant="outlined"
                                            disabled
                                            label="nome de exibição"
                                            sx={{
                                                "& .MuiInputBase-input.Mui-disabled": {
                                                    WebkitTextFillColor: "black",
                                                },
                                                "& .MuiInputLabel-root.Mui-disabled": {
                                                    color: "black",
                                                },
                                                "& .MuiOutlinedInput-notchedOutline": {
                                                    borderColor: "rgba(0, 0, 0, 0.23) !important",
                                                },
                                                "&:hover .MuiOutlinedInput-notchedOutline": {
                                                    borderColor: "rgba(0, 0, 0, 0.23) !important !important",
                                                }
                                            }}
                                        />
                                    </Box>
                                    <Box sx={{ flex: 1 }}>
                                        <TextField
                                            value={userProfile.location || ' '}
                                            fullWidth
                                            margin="normal"
                                            variant="outlined"
                                            disabled
                                            label="localização"
                                            sx={{
                                                "& .MuiInputBase-input.Mui-disabled": {
                                                    WebkitTextFillColor: "black",
                                                },
                                                "& .MuiInputLabel-root.Mui-disabled": {
                                                    color: "black",
                                                },
                                                "& .MuiOutlinedInput-notchedOutline": {
                                                    borderColor: "rgba(0, 0, 0, 0.23) !important",
                                                },
                                                "&:hover .MuiOutlinedInput-notchedOutline": {
                                                    borderColor: "rgba(0, 0, 0, 0.23) !important !important",
                                                }
                                            }}
                                        />
                                    </Box>
                                </Box>

                                <Box sx={{ mt: 2 }}>
                                    <TextField
                                        value={userProfile.bio || ' '}
                                        fullWidth
                                        margin="normal"
                                        variant="outlined"
                                        multiline
                                        rows={4}
                                        disabled
                                        label="biografia"
                                        sx={{
                                            "& .MuiInputBase-input.Mui-disabled": {
                                                WebkitTextFillColor: "black",
                                            },
                                            "& .MuiInputLabel-root.Mui-disabled": {
                                                color: "black",
                                            },
                                            "& .MuiOutlinedInput-notchedOutline": {
                                                borderColor: "rgba(0, 0, 0, 0.23) !important",
                                            },
                                            "&:hover .MuiOutlinedInput-notchedOutline": {
                                                borderColor: "rgba(0, 0, 0, 0.23) !important !important",
                                            }
                                        }}
                                    />
                                </Box>
                            </Box>
                        )}
                    </Box>
                </Box>
            )}

            <Divider sx={{ marginTop: 4, borderColor: 'transparent' }} />

            <Typography variant="h5" sx={{ color: '#666', mt: 4 }}>
                comentários recentes
            </Typography>

            <UserComments userId={id!} />

            <Divider sx={{ marginTop: 4, borderColor: 'transparent' }} />

            <Typography variant="h5" sx={{ color: '#666', mt: 4 }}>
                jams do usuário
            </Typography>

            {isTracksLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <Loader />
                </Box>
            ) : tracks.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, mt: 4 }}>
                    {tracks.map((track) => (
                        <CompactTrack
                            key={track.id}
                            id={track.id}
                            imageUrl={track.imageUrl}
                            title={track.title}
                            audioFileUrl={track.audioFileUrl}
                            playCount={track.playCount}
                            username={track.username}
                            userId={track.userId}
                            tags={track.tags}
                            likeCount={track.likeCount}
                            createdAt={track.createdAt}
                            userLikedTrack={track.userLikedTrack}
                            originalDuration={track.duration}
                            updatedAt={track.updatedAt}
                        />
                    ))}
                </Box>
            ) : null}

            {!isTracksLoading && tracks.length === 0 && (
                <Typography sx={{ color: 'text.secondary', textAlign: 'left', mt: 3 }}>
                    nenhuma jam por aqui.
                </Typography>
            )}

            {hasNextPage && (
                <div ref={loaderRef} style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
                    <Loader />
                </div>
            )}

            {isTracksError && <div>Error: {tracksError.message}</div>}

            <Divider sx={{ marginTop: 8, borderColor: 'transparent' }} />

        </Container>
    );
};

export default UserProfilePage;