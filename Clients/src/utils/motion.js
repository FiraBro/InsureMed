export const staggerContainer = (staggerChildren, delayChildren) => ({
  hidden: {},
  show: {
    transition: {
      staggerChildren: staggerChildren || 0.1,
      delayChildren: delayChildren || 0,
    },
  },
});

export const fadeIn = (direction, type, delay, duration) => ({
  hidden: {
    x: direction === "left" ? 50 : direction === "right" ? -50 : 0,
    y: direction === "up" ? 50 : direction === "down" ? -50 : 0,
    opacity: 0,
  },
  show: {
    x: 0,
    y: 0,
    opacity: 1,
    transition: {
      type: type || "spring",
      delay: delay || 0,
      duration: duration || 0.75,
      ease: "easeOut",
    },
  },
});

export const zoomIn = (delay, duration) => ({
  hidden: {
    scale: 0.5,
    opacity: 0,
  },
  show: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      delay: delay || 0,
      duration: duration || 0.75,
    },
  },
});
