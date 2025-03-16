import { FC, useState, useEffect } from 'react'
import { Box, Typography } from '@mui/material'
import InfoIcon from '@mui/icons-material/Info'
import { motion, AnimatePresence } from 'framer-motion'

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
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
    }, 6000)

    return () => clearTimeout(timer)
  }, [message])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key={message}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          style={{ pointerEvents: 'none' }}
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
      )}
    </AnimatePresence>
  )
}

export default AlertCard
