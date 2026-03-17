import React, { useEffect, useState, useRef } from "react";
import { Button, TextField, Typography, Box, Avatar, IconButton, Container, Grid, Tabs, Tab } from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import EditIcon from '@mui/icons-material/Edit';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';

import TrackCover from "../components/trackcover";
import { useUser } from "../contexts/usercontext";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { motion } from "framer-motion";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { cropToSquare } from "../utils/imageUtils";
import { useQuery, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import Track from "../components/track";
import TrackSkeleton from "../components/trackskeleton";
import UserComments from "../components/usercomments";
import RecentTracks from "../components/userplays";
import RecentLikes from "../components/userlikes";
import CompactTrackSkeleton from "../components/compacttrackskeleton";
import UserProfileSkeleton from "./userskeleton";
import ProfileCommentsPanel from "../components/profilecommentspanel";
import type { Track as TrackItem } from '../contexts/trackcontext';

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
    const navigate = useNavigate();
    const { updateUserProfile, user } = useUser();
    const [image, setImage] = useState<File | null>(null);
    const [hover, setHover] = useState(false);
    const [bioLength, setBioLength] = useState(0);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [avatarModalOpen, setAvatarModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'jams' | 'comments'>('jams');
    const [profileCommentsCount, setProfileCommentsCount] = useState(0);
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
    const jamsCount = data?.pages?.[0]?.totalCount ?? tracks.length;
    const queryClient = useQueryClient();

    // Map API shape to context's Track shape (duration → originalDuration)
    const playlistTracks: TrackItem[] = tracks.map((t: any) => ({ ...t, originalDuration: t.duration ?? t.originalDuration ?? '' }));

    const { data: recentPlaysData, isLoading: isLoadingPlays } = useQuery({
        queryKey: ['recentPlays', id],
        queryFn: () =>
            api.get('TrackPlay/byUser', { params: { userId: id, pageNumber: 1, pageSize: 3 } })
                .then((r) => r.data.data.tracks.items),
        enabled: !!id,
    });

    const { data: recentLikesData, isLoading: isLoadingLikes } = useQuery({
        queryKey: ['recentLikes', id],
        queryFn: () =>
            api.get('TrackLike/byUser', { params: { userId: id, pageNumber: 1, pageSize: 3 } })
                .then((r) => r.data.data.tracks.items),
        enabled: !!id,
    });

    const recentPlays = recentPlaysData ?? [];
    const recentLikes = recentLikesData ?? [];

    const { data: userProfileCommentsCountData } = useQuery({
        queryKey: ['userProfileCommentsCount', userProfile?.id],
        queryFn: async () => {
            const response = await api.get('UserProfileComment/byProfile', {
                params: {
                    userProfileId: userProfile?.id,
                    pageNumber: 1,
                    pageSize: 1,
                },
            });
            return response.data.data.comments.totalCount as number;
        },
        enabled: !!userProfile?.id,
    });

    useEffect(() => {
        if (userProfile) {
            reset({
                displayName: userProfile.displayName,
                bio: userProfile.bio,
                location: userProfile.location,
                profilePictureUrl: userProfile.profilePictureUrl,
            });
        }
    }, [userProfile, reset]);

    useEffect(() => {
        if (typeof userProfileCommentsCountData === 'number') {
            setProfileCommentsCount(userProfileCommentsCountData);
        }
    }, [userProfileCommentsCountData]);

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
            queryClient.invalidateQueries({ queryKey: ['userProfile', id] });
            setIsSaving(false);
            setIsEditing(false);
        } catch (error) {
            setIsSaving(false);
        }
    };

    const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const file = event.target.files[0];
            const squared = await cropToSquare(file);
            setImage(squared);
            setImagePreview(URL.createObjectURL(squared));
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
        return <UserProfileSkeleton />;
    }

    if (isProfileError) {
        return <Typography variant="h6">Error: {profileError.message}</Typography>;
    }

    if (!userProfile) {
        return <Typography variant="h6">User not found</Typography>;
    }

    const avatarSrc = imagePreview
        ? imagePreview
        : userProfile?.profilePictureUrl
            ? `${userProfile.profilePictureUrl}?t=${userProfile.updatedAt}`
            : '/jamcoredefaultpicture.jpg';

    return (
        <Box sx={{ minHeight: '100vh', backgroundColor: '#FAFAFA' }}>

            {/* Header banner */}
            <Box sx={{ backgroundColor: '#fff', borderBottom: '1px solid rgba(0,0,0,0.06)', pt: 10, pb: 4, px: { xs: 2, sm: 4 } }}>
                <Container maxWidth="lg">
                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                        <Box>
                            <Typography variant="body2" sx={{ color: '#aaa', mb: 0.5, letterSpacing: '0.05em', fontSize: '0.72rem' }}>
                                {isCurrentUser ? 'meu perfil' : `perfil de @${userProfile.username}`}
                            </Typography>
                            <Typography variant="h4" sx={{ fontWeight: 700, color: '#111', lineHeight: 1.2 }}>
                                {userProfile.displayName || userProfile.username}
                            </Typography>
                            <Typography variant="body1" sx={{ color: '#777', mt: 0.5 }}>
                                {isCurrentUser ? 'gerencie suas informações e veja suas jams.' : `veja as jams e atividade de @${userProfile.username}.`}
                            </Typography>
                        </Box>
                    </motion.div>
                </Container>
            </Box>

            {/* Voltar ao feed */}
            <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 4 }, mt: 2 }}>
                <Box sx={{ py: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton size="small" onClick={() => navigate('/feed')} sx={{ color: '#777', '&:hover': { color: '#111' } }}>
                        <ArrowBackIcon fontSize="small" />
                    </IconButton>
                    <Button size="small" variant="text" onClick={() => navigate('/feed')} sx={{ color: '#777', textTransform: 'none' }}>
                        voltar ao feed
                    </Button>
                </Box>
            </Container>

            <Container maxWidth="lg" sx={{ py: 2, px: { xs: 2, sm: 3 } }}>

            {/* Profile card */}
            <Box
                sx={{
                    backgroundColor: '#fff',
                    borderRadius: '16px',
                    border: '1px solid rgba(0,0,0,0.07)',
                    p: { xs: 3, md: 4 },
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    gap: 4,
                    alignItems: { xs: 'center', md: 'flex-start' },
                    mb: 3,
                }}
            >
                {/* Avatar */}
                <Box
                    sx={{
                        position: 'relative',
                        width: { xs: 120, md: 160 },
                        height: { xs: 120, md: 160 },
                        flexShrink: 0,
                        borderRadius: '50%',
                        overflow: 'hidden',
                        cursor: 'pointer',
                    }}
                    onClick={() => { if (!isEditing) setAvatarModalOpen(true); }}
                    onMouseEnter={() => { if (isEditing) setHover(true); }}
                    onMouseLeave={() => setHover(false)}
                >
                    <Avatar src={avatarSrc} alt="foto do perfil" sx={{ width: '100%', height: '100%' }} />
                    {isEditing && hover && (
                        <Box
                            sx={{
                                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                                backgroundColor: 'rgba(0,0,0,0.48)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}
                        >
                            <IconButton component="label">
                                <CloudUploadIcon sx={{ color: '#fff' }} />
                                <input type="file" hidden onChange={handleImageChange} accept="image/*" />
                            </IconButton>
                        </Box>
                    )}
                </Box>

                <Box sx={{ flex: 1, width: '100%' }}>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        {/* Nome */}
                        {isEditing ? (
                            <Controller
                                name="displayName"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        variant="standard"
                                        fullWidth
                                        placeholder="nome de exibição"
                                        inputProps={{ style: { fontSize: '1.5rem', fontWeight: 700, color: '#111', lineHeight: 1.2 } }}
                                        sx={{ mb: 0.5 }}
                                    />
                                )}
                            />
                        ) : (
                            <Typography variant="h5" sx={{ fontWeight: 700, color: '#111', lineHeight: 1.2 }}>
                                {userProfile.displayName || userProfile.username}
                            </Typography>
                        )}

                        {/* Username (readonly) */}
                        <Typography variant="body2" sx={{ color: '#888', mb: 1.5 }}>
                            @{userProfile.username}
                        </Typography>

                        {/* Localização */}
                        {isEditing ? (
                            <Controller
                                name="location"
                                control={control}
                                render={({ field }) => (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5 }}>
                                        <PlaceOutlinedIcon sx={{ fontSize: 16, color: '#aaa' }} />
                                        <TextField
                                            {...field}
                                            variant="standard"
                                            placeholder="adicionar localização"
                                            size="small"
                                            inputProps={{ style: { fontSize: '0.875rem', color: '#555' } }}
                                            sx={{ flex: 1 }}
                                        />
                                    </Box>
                                )}
                            />
                        ) : userProfile.location ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5 }}>
                                <PlaceOutlinedIcon sx={{ fontSize: 16, color: '#aaa' }} />
                                <Typography variant="body2" sx={{ color: '#555' }}>{userProfile.location}</Typography>
                            </Box>
                        ) : null}

                        {/* Bio */}
                        {isEditing ? (
                            <Controller
                                name="bio"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        variant="standard"
                                        fullWidth
                                        multiline
                                        placeholder="escreva sua bio..."
                                        inputProps={{ maxLength: 500, style: { fontSize: '1rem', color: '#444', lineHeight: 1.65 } }}
                                        sx={{ mt: 0.5 }}
                                    />
                                )}
                            />
                        ) : userProfile.bio ? (
                            <Typography variant="body1" sx={{ color: '#444', lineHeight: 1.65, mt: 1 }}>
                                {userProfile.bio}
                            </Typography>
                        ) : isCurrentUser ? (
                            <Typography variant="body2" sx={{ color: '#bbb', fontStyle: 'italic', mt: 1 }}>
                                nenhuma bio ainda. clique em editar para adicionar.
                            </Typography>
                        ) : null}

                        {/* Contador de bio + ações */}
                        {isEditing && (
                            <Box sx={{ mt: 2.5 }}>
                                <Typography variant="caption" sx={{ color: '#bbb', display: 'block', textAlign: 'right', mb: 1.5 }}>
                                    {bioLength}/500
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'flex-end' }}>
                                    <Button
                                        variant="text"
                                        size="small"
                                        onClick={() => { setIsEditing(false); setImagePreview(null); setImage(null); reset({ displayName: userProfile.displayName, bio: userProfile.bio, location: userProfile.location, profilePictureUrl: userProfile.profilePictureUrl }); }}
                                        sx={{ borderRadius: '8px', color: '#888', textTransform: 'none' }}
                                    >
                                        cancelar
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        size="small"
                                        disabled={isSaving || isButtonDisabled()}
                                        sx={{ borderRadius: '8px', boxShadow: 'none', fontWeight: 700, px: 3, textTransform: 'none' }}
                                    >
                                        {isSaving ? 'salvando...' : 'salvar'}
                                    </Button>
                                </Box>
                            </Box>
                        )}

                        {/* Botão editar (modo view) */}
                        {isCurrentUser && !isEditing && (
                            <Box sx={{ mt: 2 }}>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    startIcon={<EditIcon />}
                                    onClick={() => setIsEditing(true)}
                                    sx={{ borderRadius: '8px', borderColor: '#E93434', color: '#E93434', textTransform: 'none', '&:hover': { borderColor: '#c62828', backgroundColor: 'rgba(233,52,52,0.04)' } }}
                                >
                                    editar perfil
                                </Button>
                            </Box>
                        )}
                    </form>
                </Box>
            </Box>


            <Box sx={{ mb: 2 }}>
                <Tabs
                    value={activeTab}
                    onChange={(_, value: 'jams' | 'comments') => setActiveTab(value)}
                    sx={{
                        minHeight: 40,
                        '& .MuiTabs-indicator': { backgroundColor: '#E93434', height: 2 },
                    }}
                >
                    <Tab
                        value="jams"
                        label={`jams (${jamsCount})`}
                        sx={{
                            textTransform: 'none',
                            fontWeight: 700,
                            minHeight: 40,
                            color: '#666',
                            '&.Mui-selected': { color: '#E93434' },
                        }}
                    />
                    <Tab
                        value="comments"
                        label={`comentarios (${profileCommentsCount})`}
                        sx={{
                            textTransform: 'none',
                            fontWeight: 700,
                            minHeight: 40,
                            color: '#666',
                            '&.Mui-selected': { color: '#E93434' },
                        }}
                    />
                </Tabs>
            </Box>

            <Grid container spacing={3} sx={{ alignItems: 'flex-start' }}>

                {/* ── Main content ── */}
                <Grid item xs={12} md={8}>
                    {activeTab === 'jams' ? (
                        <>
                            {isTracksLoading ? (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    {Array.from({ length: 5 }).map((_, i) => <TrackSkeleton key={i} />)}
                                </Box>
                            ) : tracks.length > 0 ? (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    {tracks.map((track, i) => (
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
                                            updatedAt={track.updatedAt}
                                            playlist={playlistTracks}
                                            playlistIndex={i}
                                        />
                                    ))}
                                </Box>
                            ) : (
                                <Typography variant="body2" sx={{ color: '#999', py: 1 }}>
                                    nenhuma jam por aqui.
                                </Typography>
                            )}
                            {hasNextPage && (
                                <Box ref={loaderRef} sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
                                    {Array.from({ length: 3 }).map((_, i) => <TrackSkeleton key={i} />)}
                                </Box>
                            )}
                            {isTracksError && (
                                <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                                    {tracksError.message}
                                </Typography>
                            )}
                        </>
                    ) : (
                        <ProfileCommentsPanel
                            userProfileId={userProfile.id}
                            profileOwnerUserId={userProfile.id}
                            onCountChange={setProfileCommentsCount}
                        />
                    )}
                </Grid>

                {/* ── Sidebar ── */}
                <Grid item xs={12} md={4}>
                    <Box sx={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.06)', p: 2.5, position: 'sticky', top: 80 }}>
                        {/* Reproduções recentes */}
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#333', mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.72rem' }}>
                            histórico de reprodução
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                            {isLoadingPlays
                                ? <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>{Array.from({ length: 3 }).map((_, i) => <CompactTrackSkeleton key={i} />)}</Box>
                                : <RecentTracks tracks={recentPlays} />}
                        </Box>

                        <Box sx={{ borderTop: '1px solid rgba(0,0,0,0.06)', pt: 2, mt: 1.5 }} />

                        {/* Curtidas recentes */}
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#333', mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.72rem' }}>
                            curtidas recentemente
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                            {isLoadingLikes
                                ? <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>{Array.from({ length: 3 }).map((_, i) => <CompactTrackSkeleton key={i} />)}</Box>
                                : <RecentLikes tracks={recentLikes} />}
                        </Box>

                        <Box sx={{ borderTop: '1px solid rgba(0,0,0,0.06)', pt: 2, mt: 1.5 }} />

                        {/* Comentários recentes */}
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#333', mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.72rem' }}>
                            comentários recentes
                        </Typography>
                        <Box>
                            <UserComments userId={id!} />
                        </Box>
                    </Box>
                </Grid>

            </Grid>

            </Container>

            <TrackCover
                open={avatarModalOpen}
                onClose={() => setAvatarModalOpen(false)}
                imageUrl={userProfile.profilePictureUrl ? `${userProfile.profilePictureUrl}?t=${userProfile.updatedAt}` : '/jamcoredefaultpicture.jpg'}
                title={userProfile.displayName || userProfile.username}
            />
        </Box>
    );
};

export default UserProfilePage;
