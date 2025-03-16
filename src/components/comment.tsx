import React from 'react';
import { Box, Typography, Avatar } from '@mui/material';

interface CommentComponentProps {
    comment: Comment;
}

interface Comment {
    text: string;
    userId: string;
    username: string;
    displayName: string;
    userProfilePictureUrl: string;
    createdAt: string;
}
const CommentComponent: React.FC<CommentComponentProps> = ({ comment }) => {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar src={comment.userProfilePictureUrl ? comment.userProfilePictureUrl : '/jamcoredefaultpicture.jpg'} alt={comment.displayName || comment.username || ''} sx={{ width: 40, height: '100%', mr: 2 }} />
            <Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="subtitle2" noWrap>
                        {comment.displayName || comment.username || ''}
                    </Typography>
                    <Typography variant="caption" color="textSecondary" sx={{ ml: 1, fontSize: 12 }}>
                        {(() => {
                            const date = new Date(comment.createdAt);
                            const today = new Date();
                            const diffTime = Math.abs(today.getTime() - date.getTime());
                            const diffSeconds = Math.ceil(diffTime / 1000);
                            const diffMinutes = Math.ceil(diffSeconds / 60);
                            const diffHours = Math.ceil(diffMinutes / 60);
                            const diffDays = Math.ceil(diffHours / 24);

                            if (diffSeconds < 60) {
                                return `${diffSeconds} ${diffSeconds === 1 ? 'segundo' : 'segundos'} atrás`;
                            } else if (diffMinutes < 60) {
                                return `${diffMinutes} ${diffMinutes === 1 ? 'minuto' : 'minutos'} atrás`;
                            } else if (diffHours < 24) {
                                return `${diffHours} ${diffHours === 1 ? 'hora' : 'horas'} atrás`;
                            } else if (diffDays < 30) {
                                return `${diffDays} ${diffDays === 1 ? 'dia' : 'dias'} atrás`;
                            } else if (diffDays < 365) {
                                return `${Math.ceil(diffDays / 30)} ${Math.ceil(diffDays / 30) === 1 ? 'mês' : 'meses'} atrás`;
                            } else {
                                return `${Math.ceil(diffDays / 365)} ${Math.ceil(diffDays / 365) === 1 ? 'ano' : 'anos'} atrás`;
                            }
                        })()}
                    </Typography>
                </Box>
                <Typography variant="body1" sx={{ mt: 0.5 }}>
                “{comment.text}”
                </Typography>
            </Box>
        </Box>
    );
};

export default CommentComponent;
