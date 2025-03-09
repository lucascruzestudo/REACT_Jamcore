import { FC, useState } from 'react'
import { Box, Typography } from '@mui/material'
import InfoIcon from '@mui/icons-material/Info'
import { motion } from 'framer-motion'

interface AlertCardProps {
  message: string
  type: 'success' | 'error'
}

const styles = {
  success: {
    backgroundColor: '#4caf50',
    color: '#fff',
  },
  error: {
    backgroundColor: '#f44336',
    color: '#fff',
  },
}

const AlertCard: FC<AlertCardProps> = ({ message, type }) => {
  const [isVisible] = useState(true)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          padding: '10px 20px',
          borderRadius: '4px',
          marginBottom: '16px',
          boxShadow: '0px 2px 8px rgba(0,0,0,0.2)',
          ...styles[type],
        }}
      >
        <InfoIcon sx={{ marginRight: '4px', flexShrink: 0 }} />
        <Typography
          variant="body2"
          sx={{
            flex: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'pre-wrap',
          }}
        >
          {message}
        </Typography>
      </Box>
    </motion.div>
  )
}

export default AlertCard

