import React, { useState, useCallback } from "react";
import {
    Button, TextField, Typography, Box, IconButton, Container, FormControlLabel,
    Radio, RadioGroup, FormControl, FormLabel
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PaletteIcon from '@mui/icons-material/Palette';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { cropToSquare } from "../utils/imageUtils";
import { motion } from "framer-motion";
import WaveformVisualizer from "../components/waveformvisualizer";

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
        mode: "onChange",
    });

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageHovered, setImageHovered] = useState<boolean>(false);
    const [audioPreview, setAudioPreview] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [_audioProgress, setAudioProgress] = useState<number>(0);
    const [audioCurrentTime, setAudioCurrentTime] = useState<number>(0);
    const [audioDuration, setAudioDuration] = useState<number>(0);
    const [tagsInput, setTagsInput] = useState<string>("");
    const [audioFileName, setAudioFileName] = useState<string | null>(null);
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
            const response = await api.post("/Track", formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            navigate(`/track/${response.data.data.id}`);
        } catch (error) {
            console.error("Error creating track:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const squared = await cropToSquare(event.target.files[0]);
            setValue("imageFile", squared);
            setImagePreview(URL.createObjectURL(squared));
        }
    };

    const handleAudioChange = (files: FileList | null) => {
        if (files && files[0]) {
            const file = files[0];
            const isMP3 = file.name.toLowerCase().endsWith('.mp3') && file.type === 'audio/mpeg';
            const isValidSize = file.size <= 10 * 1024 * 1024;
            if (!isMP3 || !isValidSize) {
                alert("O arquivo deve estar no formato MP3 e ter no máximo 10MB.");
                return;
            }
            if (!watch("title")) setValue("title", file.name.split('.').slice(0, -1).join('.'));
            setValue("trackFile", file);
            setAudioPreview(URL.createObjectURL(file));
            setAudioFileName(file.name);
        }
        setAudioProgress(0);
        setAudioCurrentTime(0);
        setAudioDuration(0);
        setIsPlaying(false);
    };

    const handlePlayPause = () => {
        if (audioRef.current) {
            if (isPlaying) audioRef.current.pause();
            else audioRef.current.play();
            setIsPlaying(!isPlaying);
        }
    };

    const handleTagsInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter" || event.key === ",") {
            event.preventDefault();
            const newTag = tagsInput.trim();
            if (newTag) {
                setValue("tags", [...watch("tags"), newTag.toLocaleLowerCase()]);
                setTagsInput("");
            }
        }
    };

    const removeTag = (index: number) => {
        setValue("tags", watch("tags").filter((_, i) => i !== index));
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
        <Box sx={{ minHeight: '100vh', backgroundColor: '#FAFAFA' }}>

            {/* Header banner */}
            <Box sx={{ backgroundColor: '#fff', borderBottom: '1px solid rgba(0,0,0,0.06)', pt: 10, pb: 4, px: { xs: 2, sm: 4 } }}>
                <Container maxWidth="md">
                        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                            <Typography variant="body2" sx={{ color: '#aaa', mb: 0.5, letterSpacing: '0.05em', fontSize: '0.72rem' }}>
                                nova jam
                            </Typography>
                            <Typography variant="h4" sx={{ fontWeight: 700, color: '#111', lineHeight: 1.2 }}>
                                criar jam
                            </Typography>
                            <Typography variant="body1" sx={{ color: '#777', mt: 0.5 }}>
                                faça upload do seu áudio e personalize as informações.
                            </Typography>
                        </motion.div>
                    </Container>
            </Box>

                {/* Voltar ao feed (no fundo cinza) */}
                <Container maxWidth="md" sx={{ px: { xs: 2, sm: 4 }, mt: 2 }}>
                    <Box sx={{ backgroundColor: '#FAFAFA', py: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton size="small" onClick={() => navigate('/feed')} sx={{ color: '#777', '&:hover': { color: '#111' } }}>
                            <ArrowBackIcon fontSize="small" />
                        </IconButton>
                        <Button size="small" variant="text" onClick={() => navigate('/feed')} sx={{ color: '#777', textTransform: 'none' }}>
                            voltar ao feed
                        </Button>
                    </Box>
                </Container>

            {/* Card */}
            <Container maxWidth="md" sx={{ py: 2, px: { xs: 2, sm: 3 } }}>
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
                    <Box sx={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                        <form onSubmit={handleSubmit(onSubmit)}>

                            {/* ── Áudio ── */}
                            <Box sx={{ px: { xs: 2, sm: 3 }, pt: 3, pb: 2.5, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                                <Typography variant="body2" sx={{ fontWeight: 700, color: '#333', mb: 2, textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.72rem' }}>
                                    arquivo de áudio
                                </Typography>

                                {!audioPreview ? (
                                    <Box
                                        sx={{
                                            border: '2px dashed rgba(0,0,0,0.08)',
                                            borderRadius: '12px',
                                            p: 3,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            gap: 1,
                                            textAlign: 'center',
                                            backgroundColor: 'rgba(0,0,0,0.02)',
                                            cursor: 'pointer',
                                            transition: 'border-color 0.2s, background-color 0.2s',
                                            '&:hover': { borderColor: 'rgba(0,0,0,0.12)', backgroundColor: 'rgba(0,0,0,0.03)' },
                                        }}
                                        onDragOver={handleDragOver}
                                        onDrop={handleDrop}
                                    >
                                        <CloudUploadIcon sx={{ color: '#E93434', fontSize: 32, opacity: 0.85 }} />
                                        <Typography variant="body2" component="label" sx={{ cursor: 'pointer', color: '#555' }}>
                                            arraste ou{' '}
                                            <Box component="span" sx={{ color: 'primary.main', fontWeight: 600 }}>clique para selecionar</Box>
                                            {' '}(.mp3, máx. 10mb)
                                            <input type="file" hidden onChange={(e) => handleAudioChange(e.target.files)} accept="audio/mp3" />
                                        </Typography>
                                    </Box>
                                ) : (
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1.5,
                                            backgroundColor: '#FFFFFF',
                                            border: '1px solid rgba(0,0,0,0.06)',
                                            borderRadius: '10px',
                                            px: 2,
                                            py: 1.5,
                                        }}
                                        onDragOver={handleDragOver}
                                        onDrop={handleDrop}
                                    >
                                        {/* Play column */}
                                        <Box sx={{ width: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <IconButton size="small" onClick={handlePlayPause} sx={{ color: '#E93434', p: 0.5 }}>
                                                {isPlaying ? <PauseIcon fontSize="small" /> : <PlayArrowIcon fontSize="small" />}
                                            </IconButton>
                                        </Box>

                                        {/* Waveform column */}
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Typography variant="caption" sx={{ color: '#555', fontWeight: 600, display: 'block' }} noWrap>
                                                {audioFileName}
                                            </Typography>
                                            <Box sx={{ mt: 0.5 }}>
                                                <Box sx={{ bgcolor: '#FFFFFF', border: '1px solid rgba(0,0,0,0.06)', borderRadius: 2, p: 1, boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
                                                    <WaveformVisualizer
                                                        audioUrl={audioPreview!}
                                                        currentTime={audioCurrentTime}
                                                        duration={audioDuration}
                                                        isActive={true}
                                                        onSeek={(time) => {
                                                            if (audioRef.current) {
                                                                audioRef.current.currentTime = time;
                                                                setAudioCurrentTime(time);
                                                                setAudioProgress(audioDuration ? (time / audioDuration) * 100 : 0);
                                                            }
                                                        }}
                                                        playedColor="#E93434"
                                                        unplayedColor="#E9E9E9"
                                                        height={68}
                                                    />
                                                </Box>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                                                    <Typography variant="caption" sx={{ fontSize: '0.75rem', color: '#555' }}>
                                                        {Math.floor(audioCurrentTime / 60)}:{Math.floor(audioCurrentTime % 60).toString().padStart(2, '0')}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ fontSize: '0.75rem', color: '#555' }}>
                                                        {audioDuration ? `${Math.floor(audioDuration / 60)}:${Math.floor(audioDuration % 60).toString().padStart(2, '0')}` : '0:00'}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Box>

                                        {/* Upload column */}
                                        <Box sx={{ width: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <IconButton size="small" component="label" sx={{ color: '#999' }}>
                                                <CloudUploadIcon fontSize="small" />
                                                <input type="file" hidden onChange={(e) => handleAudioChange(e.target.files)} accept="audio/mp3" />
                                            </IconButton>
                                        </Box>

                                        <audio
                                            ref={audioRef}
                                            src={audioPreview}
                                            onLoadedMetadata={(e) => {
                                                const d = e.currentTarget.duration || 0;
                                                setAudioDuration(d);
                                            }}
                                            onTimeUpdate={(e) => {
                                                const cur = e.currentTarget.currentTime || 0;
                                                const dur = e.currentTarget.duration || audioDuration || 0;
                                                setAudioCurrentTime(cur);
                                                setAudioProgress(dur ? (cur / dur) * 100 : 0);
                                            }}
                                            onEnded={() => setIsPlaying(false)}
                                        />
                                    </Box>
                                )}
                            </Box>


                            
                            {/* ── Capa + campos ── */}
                            <Box sx={{ px: { xs: 2, sm: 3 }, py: 2.5 }}>
                                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 3, alignItems: 'flex-start' }}>

                                    {/* Cover image */}
                                    <Box sx={{ flexShrink: 0, width: { xs: '100%', sm: 160 } }}>
                                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#333', mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.72rem' }}>
                                            capa
                                        </Typography>
                                        <Box
                                            sx={{
                                                position: 'relative',
                                                width: '100%',
                                                aspectRatio: '1/1',
                                                borderRadius: '12px',
                                                overflow: 'hidden',
                                                backgroundColor: 'rgba(0,0,0,0.02)',
                                                border: '2px dashed rgba(0,0,0,0.08)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                cursor: 'pointer',
                                                transition: 'border-color 0.2s, background-color 0.2s',
                                                '&:hover': { borderColor: 'rgba(0,0,0,0.12)', backgroundColor: 'rgba(0,0,0,0.03)' },
                                            }}
                                            onMouseEnter={() => setImageHovered(true)}
                                            onMouseLeave={() => setImageHovered(false)}
                                        >
                                            {imagePreview ? (
                                                <img src={imagePreview} alt="capa" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                                            ) : (
                                                <Box sx={{ textAlign: 'center', opacity: 1 }}>
                                                    <PaletteIcon sx={{ fontSize: 36, color: '#E93434', opacity: 0.9 }} />
                                                    <Typography variant="caption" display="block" sx={{ color: '#555', mt: 0.5 }}>adicionar arte</Typography>
                                                </Box>
                                            )}
                                            {imageHovered && (
                                                <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <IconButton component="label" sx={{ color: '#fff' }}>
                                                        <CloudUploadIcon />
                                                        <input type="file" hidden onChange={handleImageChange} accept="image/*" />
                                                    </IconButton>
                                                </Box>
                                            )}
                                        </Box>
                                    </Box>

                                    {/* Form fields */}
                                    <Box sx={{ flex: 1, width: '100%' }}>
                                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#333', mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.72rem' }}>
                                            informações
                                        </Typography>
                                        <Controller
                                            name="title"
                                            control={control}
                                            rules={{ required: true }}
                                            render={({ field }) => (
                                                <TextField {...field} label="título" fullWidth margin="dense" size="small" />
                                            )}
                                        />
                                        <Controller
                                            name="description"
                                            control={control}
                                            rules={{ required: true }}
                                            render={({ field }) => (
                                                <TextField {...field} label="descrição" fullWidth margin="dense" size="small" multiline rows={3} />
                                            )}
                                        />
                                        <FormControl sx={{ mt: 1 }}>
                                            <FormLabel sx={{ fontSize: '0.75rem' }}>privacidade</FormLabel>
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
                                                        <FormControlLabel value="public" control={<Radio size="small" />} label={<Typography variant="caption">pública</Typography>} />
                                                        <FormControlLabel value="private" control={<Radio size="small" />} label={<Typography variant="caption">privada</Typography>} />
                                                    </RadioGroup>
                                                )}
                                            />
                                        </FormControl>
                                        <TextField
                                            label="tags"
                                            fullWidth
                                            margin="dense"
                                            size="small"
                                            value={tagsInput}
                                            onChange={(e) => setTagsInput(e.target.value)}
                                            onKeyDown={handleTagsInputKeyDown}
                                            placeholder="Enter ou vírgula para adicionar"
                                        />
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                                            {watch("tags").map((tag, index) => (
                                                <Box
                                                    key={index}
                                                    sx={{
                                                        backgroundColor: 'rgba(233,52,52,0.08)',
                                                        border: '1px solid rgba(233,52,52,0.2)',
                                                        borderRadius: '8px',
                                                        px: 1,
                                                        py: '2px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 0.5,
                                                    }}
                                                >
                                                    <Typography variant="caption" color="primary" sx={{ fontSize: '0.75rem' }}>#{tag}</Typography>
                                                    <IconButton size="small" onClick={() => removeTag(index)} sx={{ p: '1px' }}>
                                                        <CloseIcon sx={{ fontSize: 12 }} />
                                                    </IconButton>
                                                </Box>
                                            ))}
                                        </Box>
                                    </Box>
                                </Box>
                            </Box>

                            {/* ── Actions bar ── */}
                            <Box sx={{ px: { xs: 2, sm: 3 }, py: 2, borderTop: '1px solid rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'flex-end' }}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    size="small"
                                    disabled={!isFormValid || isLoading}
                                    sx={{ px: 3, borderRadius: '8px', fontWeight: 700 }}
                                >
                                    {isLoading ? "enviando..." : "criar jam"}
                                </Button>
                            </Box>

                        </form>
                    </Box>
                </motion.div>
            </Container>
        </Box>
    );
};

export default CreateTrackPage;