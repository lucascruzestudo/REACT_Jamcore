import React, { useState, useEffect } from "react";
import {
    Button, TextField, Typography, Box, IconButton, Divider, Container, FormControlLabel,
    Radio, RadioGroup, FormControl, FormLabel,
    Avatar
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloseIcon from '@mui/icons-material/Close';
import api from "../services/api";
import { useNavigate, useParams } from "react-router-dom";
import Loader from "../components/loader";

interface TrackFormData {
    title: string;
    description: string;
    isPublic: boolean;
    tags: string[];
    imageFile: File | null;
}

const UpdateTrackPage: React.FC = () => {
    const { trackid } = useParams<{ trackid: string }>();
    const { control, handleSubmit, setValue, watch } = useForm<TrackFormData>({
        defaultValues: {
            title: "",
            description: "",
            isPublic: true,
            tags: [],
            imageFile: null,
        },
        mode: "onChange"
    });

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isLoadingTrack, setIsLoadingTrack] = useState<boolean>(true);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [tagsInput, setTagsInput] = useState<string>("");
    const [isHovered, setIsHovered] = useState<boolean>(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTrack = async () => {
            setIsLoadingTrack(true);
            try {
                const response = await api.get(`/Track/${trackid}`);
                const track = response.data.data.track;

                setValue("title", track.title);
                setValue("description", track.description);
                setValue("isPublic", track.isPublic);
                setValue("tags", track.tags);
                setImagePreview(`${track.imageUrl}?t=${track.updatedAt}`);
            } catch (error) {
                console.error("Error fetching track data:", error);
            } finally {
                setIsLoadingTrack(false);
            }
        };

        if (trackid) {
            fetchTrack();
        }
    }, [trackid, setValue]);

    const onSubmit = async (data: TrackFormData) => {
        setIsLoading(true);

        const formData = new FormData();
        formData.append("trackId", String(trackid));
        formData.append("title", data.title);
        formData.append("description", data.description);
        formData.append("isPublic", data.isPublic ? "true" : "false");
        data.tags.forEach((tag, index) => formData.append(`tags[${index}]`, tag));
        if (data.imageFile) formData.append("imageFile", data.imageFile);

        try {
            const response = await api.put(`/Track`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            console.log(response);

            navigate(`/track/${response.data.data.id}`);
        } catch (error) {
            console.error("Error updating track:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const file = event.target.files[0];
            setValue("imageFile", file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleTagsInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setTagsInput(event.target.value);
    };

    const handleTagsInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter" || event.key === ",") {
            event.preventDefault();
            const newTag = tagsInput.trim();
            if (newTag) {
                const currentTags = watch("tags");
                setValue("tags", [...currentTags, newTag.toLocaleLowerCase()]);
                setTagsInput("");
            }
        }
    };

    const removeTag = (index: number) => {
        const currentTags = watch("tags");
        const newTags = currentTags.filter((_, i) => i !== index);
        setValue("tags", newTags);
    };

    const isFormValid = watch("title") && watch("description");

    if (isLoadingTrack) {
        return <Loader centered/>;
    }

    return (
        <Container>
            <Divider sx={{ marginTop: 8, borderColor: 'transparent' }} />
            <Typography variant="h5" sx={{ marginTop: 4, marginBottom: 2, color: 'secondary.main' }}>
                editar jam
            </Typography>

            <Divider sx={{ marginTop: 2, borderColor: 'transparent' }} />

            <Box sx={{ maxWidth: 800, margin: "0 auto", padding: 2, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4, alignItems: 'flex-start' }}>

                <Box sx={{ width: { xs: '100%', md: '40%' }, display: 'flex', flexDirection: 'column', gap: 2 }}>

                    <Box
                        sx={{
                            position: 'relative',
                            width: '100%',
                            aspectRatio: '1/1',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            backgroundColor: '#f0f0f0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            '&:hover .upload-button': {
                                opacity: 1,
                            }
                        }}
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                    >
                        {imagePreview ? (
                            <Avatar
                                src={imagePreview}
                                alt="Imagem da Track"
                                variant="rounded"
                                sx={{ width: '100%', height: '100%' }}
                            />
                        ) : (
                            <Typography variant="body1" color="textSecondary">
                            </Typography>
                        )}
                        {isHovered && (
                            <IconButton
                                component="label"
                                className="upload-button"
                                sx={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                    opacity: 0,
                                    transition: 'opacity 0.3s',
                                }}
                            >
                                <CloudUploadIcon />
                                <input
                                    type="file"
                                    hidden
                                    onChange={handleImageChange}
                                    accept="image/*"
                                />
                            </IconButton>
                        )}
                    </Box>
                </Box>

                <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' } }} />

                <Box sx={{ flex: 1, width: '100%' }}>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <Controller
                            name="title"
                            control={control}
                            rules={{ required: true }}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="título"
                                    fullWidth
                                    margin="normal"
                                    variant="outlined"
                                />
                            )}
                        />

                        <Controller
                            name="description"
                            control={control}
                            rules={{ required: true }}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="descrição"
                                    fullWidth
                                    margin="normal"
                                    variant="outlined"
                                    multiline
                                    rows={4}
                                />
                            )}
                        />

                        <FormControl component="fieldset" sx={{ mt: 2 }}>
                            <FormLabel component="legend">privacidade</FormLabel>
                            <Controller
                                name="isPublic"
                                control={control}
                                render={({ field }) => (
                                    <RadioGroup
                                        {...field}
                                        row
                                        value={field.value ? "public" : "private"}
                                        onChange={(e) => field.onChange(e.target.value === "public")}
                                    >
                                        <FormControlLabel value="public" control={<Radio />} label="pública" />
                                        <FormControlLabel value="private" control={<Radio />} label="privada" />
                                    </RadioGroup>
                                )}
                            />
                        </FormControl>

                        <Box sx={{ mt: 2 }}>
                            <TextField
                                label="tags"
                                fullWidth
                                margin="normal"
                                variant="outlined"
                                value={tagsInput}
                                onChange={handleTagsInputChange}
                                onKeyDown={handleTagsInputKeyDown}
                            />
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                                {watch("tags").map((tag, index) => (
                                    <Box
                                        key={index}
                                        sx={{
                                            backgroundColor: '#eee',
                                            borderRadius: '8px',
                                            padding: '2px 8px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1,
                                        }}
                                    >
                                        <Typography variant="body2" color="textPrimary" noWrap>
                                            #{tag}
                                        </Typography>
                                        <IconButton size="small" onClick={() => removeTag(index)}>
                                            <CloseIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                ))}
                            </Box>
                        </Box>

                        <Box sx={{ marginTop: 2, display: 'flex', justifyContent: 'flex-end' }}>
                            <Button type="submit" variant="contained" disabled={!isFormValid || isLoading}>
                                {isLoading ? "salvando..." : "salvar"}
                            </Button>
                        </Box>
                    </form>
                </Box>
            </Box>
            <Divider sx={{ marginTop: 8, borderColor: 'transparent' }} />
        </Container>
    );
};

export default UpdateTrackPage;