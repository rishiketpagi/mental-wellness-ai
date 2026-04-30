export function getMoodEmoji(mood) {
  switch (mood) {
    case "Happy":
      return "😊";
    case "Neutral":
      return "😐";
    case "Sad":
      return "😔";
    case "Stressed":
      return "😣";
    default:
      return "🙂";
  }
}

export function getMoodColor(mood) {
  switch (mood) {
    case "Happy":
      return "text-green-500";
    case "Neutral":
      return "text-yellow-500";
    case "Sad":
      return "text-blue-500";
    case "Stressed":
      return "text-red-500";
    default:
      return "text-gray-500";
  }
}