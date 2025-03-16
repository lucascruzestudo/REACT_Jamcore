import React, { useState, useCallback } from "react";
import {
    Button, TextField, Typography, Box, IconButton, Divider, Container, FormControlLabel,
    Slider, Avatar, Radio, RadioGroup, FormControl, FormLabel
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import CloseIcon from '@mui/icons-material/Close';
import api from "../services/api";
import { useNavigate } from "react-router-dom";

interface TrackFormData {
    title: string;
    description: string;
    isPublic: boolean;
    tags: string[];
    trackFile: File | null;
    imageFile: File | null;
}

const CreateTrackPage: React.FC = () => {
    const { control, handleSubmit, setValue, watch } = useForm<TrackFormData>({
        defaultValues: {
            title: "",
            description: "",
            isPublic: true,
            tags: [],
            trackFile: null,
            imageFile: null,
        },
        mode: "onChange"
    });

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [audioPreview, setAudioPreview] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [audioProgress, setAudioProgress] = useState<number>(0);
    const [tagsInput, setTagsInput] = useState<string>("");
    const [audioFileName, setAudioFileName] = useState<string | null>(null);
    const [isHovered, setIsHovered] = useState<boolean>(false);
    const navigate = useNavigate();

    const audioRef = React.useRef<HTMLAudioElement | null>(null);

    const onSubmit = async (data: TrackFormData) => {
        setIsLoading(true);

        const formData = new FormData();
        formData.append("title", data.title);
        formData.append("description", data.description);
        formData.append("isPublic", data.isPublic.toString());
        data.tags.forEach((tag, index) => formData.append(`tags[${index}]`, tag));
        if (data.trackFile) formData.append("trackFile", data.trackFile);
        if (data.imageFile) formData.append("imageFile", data.imageFile);

        try {
            const response = await api.post("/Track", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            console.log(response);

            navigate(`/track/${response.data.data.id}`);
        } catch (error) {
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

    const handleAudioChange = (files: FileList | null) => {
        if (files && files[0]) {
            const file = files[0];

            const isMP3 = file.name.toLowerCase().endsWith('.mp3') && file.type === 'audio/mpeg';
            const isValidSize = file.size <= 10 * 1024 * 1024;
            if (!isMP3 || !isValidSize) {
                alert("O arquivo deve estar no formato MP3 e ter no máximo 10MB devido as limitações de espaco do servidor.");
                return;
            }

            const { title } = watch();
            if (!title) {
                const fileName = file.name.split('.').slice(0, -1).join('.');
                setValue("title", fileName);
            }
            setValue("trackFile", file);
            setAudioPreview(URL.createObjectURL(file));
            setAudioFileName(file.name);
        }
        setAudioProgress(0);
        setIsPlaying(false);
    };

    const handlePlayPause = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleSliderChange = (_event: Event, newValue: number | number[]) => {
        if (audioRef.current) {
            const time = (newValue as number) * (audioRef.current.duration / 100);
            audioRef.current.currentTime = time;
            setAudioProgress(newValue as number);
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

    const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
    }, []);

    const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        handleAudioChange(event.dataTransfer.files);
    }, []);

    const isFormValid = watch("title") && watch("description") && watch("trackFile");

    return (
        <Container>
            <Divider sx={{ marginTop: 8, borderColor: 'transparent' }} />
            <Typography variant="h5" sx={{ marginTop: 4, marginBottom: 2 }}>
                criar jam
            </Typography>

            <Box
                sx={{
                    border: '2px dashed #ccc',
                    borderRadius: '8px',
                    padding: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1,
                    textAlign: 'center',
                    backgroundColor: '#f9f9f9',
                    cursor: 'pointer',
                    maxWidth: '770px',
                    width: '100%',
                    margin: 'auto'
                }}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            >
                <CloudUploadIcon sx={{ color: '#ccc' }} />
                <Typography variant="body1" component="label" sx={{ cursor: 'pointer', display: 'block', color: 'secondary.main' }}>
                    Arraste e solte o arquivo de áudio aqui ou clique para selecionar (.mp3, máximo 10MB)
                    <input
                        type="file"
                        hidden
                        onChange={(e) => handleAudioChange(e.target.files)}
                        accept="audio/mp3"
                    />
                </Typography>
                {audioFileName && (
                    <Typography variant="body2" color="textSecondary">
                        {audioFileName}
                    </Typography>
                )}
                {audioPreview && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%' }}>
                        <audio
                            ref={audioRef}
                            src={audioPreview}
                            onTimeUpdate={(e) => {
                                const progress = (e.currentTarget.currentTime / e.currentTarget.duration) * 100;
                                setAudioProgress(progress);
                            }}
                        />
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <IconButton onClick={handlePlayPause}>
                                {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                            </IconButton>
                            <Slider
                                value={audioProgress}
                                onChange={handleSliderChange}
                                sx={{ flex: 1 }}
                            />
                        </Box>
                    </Box>
                )}
            </Box>

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
                                {isLoading ? "enviando..." : "criar"}
                            </Button>
                        </Box>
                    </form>
                </Box>
            </Box>
            <Divider sx={{ marginTop: 8, borderColor: 'transparent' }} />
        </Container>
    );
};

export default CreateTrackPage;