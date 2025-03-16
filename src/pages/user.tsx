import React, { useEffect, useRef } from "react";
import { Typography, Box, Avatar, Divider, Container, TextField } from "@mui/material";
import Loader from "../components/loader";
import { useParams } from "react-router-dom";
import api from "../services/api";
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import Track from '../components/track';

interface UserProfile {
    userId: string;
    displayName: string;
    bio: string;
    location: string;
    profilePictureUrl: string;
}

const UserProfilePage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const loaderRef = useRef(null);

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
                pageSize: 10,
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
            <Divider sx={{ marginTop: 8, borderColor: 'transparent' }} />
            <Typography
                variant="h5"
                sx={{
                    color: '#666',
                    textAlign: { xs: 'center', md: 'left' },
                }}
            >
                perfil
            </Typography>

            <Box sx={{ maxWidth: 800, margin: "0 auto", padding: 2, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4, alignItems: 'center' }}>
                <Box
                    sx={{
                        width: { xs: 150, md: 200 },
                        height: { xs: 150, md: 200 },
                        borderRadius: '50%',
                        overflow: 'hidden',
                    }}
                >
                    <Avatar
                        src={userProfile.profilePictureUrl ? `${userProfile.profilePictureUrl}?t=${new Date().getTime()}` : '/jamcoredefaultpicture.jpg'}
                        alt="foto de perfil"
                        sx={{ width: '100%', height: '100%' }}
                    />
                </Box>

                <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' } }} />

                <Box sx={{ flex: 1, width: '100%' }}>
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mb: 2 }}>
                        <Box sx={{ flex: 1 }}>
                            <TextField
                                value={userProfile.displayName}
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
                                value={userProfile.location}
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
                            value={userProfile.bio}
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
            </Box>

            <Divider sx={{ marginTop: 8, borderColor: 'transparent' }} />

            <Typography variant="h5" sx={{ color: '#666', mt: 4 }}>
                jams do usuário
            </Typography>

            <Container sx={{ display: 'flex', flexDirection: 'column', gap: 4, mt: 4 }}>
                {tracks.map((track) => (
                    <Track
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
                    />
                ))}
            </Container>

            {isTracksLoading && <Loader />}

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