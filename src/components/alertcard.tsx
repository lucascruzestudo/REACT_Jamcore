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

  // Use effect to hide the alert after 3 seconds and remove it from the DOM
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
    }, 3000)

    // Cleanup the timeout when the component is unmounted or message changes
    return () => clearTimeout(timer)
  }, [message])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key={message}  // Use the message as a unique key to reset animation
          initial={{ opacity: 0 }}  // Initial state: invisible
          animate={{ opacity: 1 }}   // Animate to visible
          exit={{ opacity: 0 }}      // Fade out before removal
          transition={{ duration: 0.5 }} // Duration for both fade-in and fade-out
          style={{ pointerEvents: 'none' }} // Ensures the element can't be interacted with while fading
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
