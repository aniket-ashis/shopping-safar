import * as FaIcons from "react-icons/fa";
import * as FiIcons from "react-icons/fi";
import * as IoIcons from "react-icons/io5";

/**
 * Maps icon names from constants.js to actual React Icons components
 */
const iconMap = {
  // Font Awesome Icons
  ...Object.keys(FaIcons).reduce((acc, key) => {
    acc[key] = FaIcons[key];
    return acc;
  }, {}),
  // Feather Icons
  ...Object.keys(FiIcons).reduce((acc, key) => {
    acc[key] = FiIcons[key];
    return acc;
  }, {}),
  // Ionicons
  ...Object.keys(IoIcons).reduce((acc, key) => {
    acc[key] = IoIcons[key];
    return acc;
  }, {}),
};

export const getIcon = (iconName) => {
  return iconMap[iconName] || FaIcons.FaQuestionCircle;
};

export default getIcon;
