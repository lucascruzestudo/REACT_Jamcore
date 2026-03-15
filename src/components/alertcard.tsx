import { FC, useState, useEffect } from 'react'
import { Box, Typography } from '@mui/material'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import { motion, AnimatePresence } from 'framer-motion'

interface AlertCardProps {
  message: string
  type: 'success' | 'error'
}

const config = {
  success: {
    bg: '#F0FAF0',
    border: '#A8D5A8',
    color: '#1B5E20',
    icon: <CheckCircleOutlineIcon sx={{ fontSize: 18 }} />,
  },
  error: {
    bg: '#FEF2F2',
    border: '#F5ACAC',
    color: '#7F1D1D',
    icon: <ErrorOutlineIcon sx={{ fontSize: 18 }} />,
  },
}

const AlertCard: FC<AlertCardProps> = ({ message, type }) => {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    setIsVisible(true)
    const timer = setTimeout(() => setIsVisible(false), 6000)
    return () => clearTimeout(timer)
  }, [message])

  const { bg, border, color, icon } = config[type]

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key={message}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
          style={{ width: '100%', marginBottom: '12px' }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 1,
              px: 2,
              py: 1.5,
              borderRadius: '10px',
              border: `1px solid ${border}`,
              backgroundColor: bg,
              color,
            }}
          >
            <Box sx={{ mt: '1px', flexShrink: 0, color }}>{icon}</Box>
            <Typography
              variant="body2"
              sx={{ color, lineHeight: 1.5, flex: 1, fontSize: '0.85rem' }}
            >
              {message}
            </Typography>
          </Box>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default AlertCard
