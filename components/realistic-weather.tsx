interface RealisticWeatherProps {
  condition: string
  size?: number
}

export default function RealisticWeather({ condition, size = 120 }: RealisticWeatherProps) {
  const conditionLower = condition.toLowerCase()

  if (conditionLower.includes("rain")) {
    return (
      <svg width={size} height={size} viewBox="0 0 200 200" className="drop-shadow-lg">
        {/* Rain clouds */}
        <g id="raincloud">
          <path
            d="M 50 80 Q 40 80 35 70 Q 35 55 50 50 Q 55 40 70 40 Q 85 40 95 50 Q 110 50 120 60 Q 125 50 135 50 Q 155 50 160 70 Q 165 80 155 85 Z"
            fill="#9CA3AF"
          />
          {/* Rain drops */}
          <line x1="70" y1="90" x2="65" y2="110" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" />
          <line x1="100" y1="95" x2="95" y2="115" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" />
          <line x1="130" y1="90" x2="125" y2="110" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" />
        </g>
      </svg>
    )
  }

  if (conditionLower.includes("cloud")) {
    return (
      <svg width={size} height={size} viewBox="0 0 200 200" className="drop-shadow-lg">
        {/* Cloudy */}
        <path
          d="M 40 100 Q 30 100 25 90 Q 25 75 40 70 Q 45 60 60 60 Q 75 60 85 70 Q 100 70 110 80 Q 115 70 125 70 Q 145 70 150 90 Q 155 100 145 105 Z"
          fill="#D1D5DB"
        />
        <path
          d="M 50 110 Q 40 110 35 100 Q 35 85 50 80 Q 55 70 70 70 Q 85 70 95 80 Q 110 80 120 90 Q 125 80 135 80 Q 155 80 160 100 Q 165 110 155 115 Z"
          fill="#E5E7EB"
        />
      </svg>
    )
  }

  if (conditionLower.includes("clear") || conditionLower.includes("sunny")) {
    return (
      <svg width={size} height={size} viewBox="0 0 200 200" className="drop-shadow-lg">
        {/* Sun */}
        <circle cx="100" cy="100" r="40" fill="#FBBF24" />
        {/* Rays */}
        <g stroke="#FBBF24" strokeWidth="6" strokeLinecap="round">
          <line x1="100" y1="20" x2="100" y2="40" />
          <line x1="100" y1="160" x2="100" y2="180" />
          <line x1="20" y1="100" x2="40" y2="100" />
          <line x1="160" y1="100" x2="180" y2="100" />
          <line x1="40" y1="40" x2="55" y2="55" />
          <line x1="145" y1="145" x2="160" y2="160" />
          <line x1="160" y1="40" x2="145" y2="55" />
          <line x1="55" y1="145" x2="40" y2="160" />
        </g>
      </svg>
    )
  }

  if (conditionLower.includes("snow")) {
    return (
      <svg width={size} height={size} viewBox="0 0 200 200" className="drop-shadow-lg">
        {/* Snow cloud */}
        <path
          d="M 40 100 Q 30 100 25 90 Q 25 75 40 70 Q 45 60 60 60 Q 75 60 85 70 Q 100 70 110 80 Q 115 70 125 70 Q 145 70 150 90 Q 155 100 145 105 Z"
          fill="#D1D5DB"
        />
        {/* Snowflakes */}
        <g fill="#E0F2FE" stroke="#0EA5E9" strokeWidth="1">
          <circle cx="60" cy="120" r="4" />
          <circle cx="100" cy="130" r="4" />
          <circle cx="140" cy="120" r="4" />
          <path d="M 70 140 L 70 160 M 65 150 L 75 150" stroke="#0EA5E9" strokeWidth="2" />
          <path d="M 110 145 L 110 165 M 105 155 L 115 155" stroke="#0EA5E9" strokeWidth="2" />
        </g>
      </svg>
    )
  }

  if (conditionLower.includes("fog") || conditionLower.includes("mist")) {
    return (
      <svg width={size} height={size} viewBox="0 0 200 200" className="drop-shadow-lg">
        {/* Fog layers */}
        <path
          d="M 20 80 Q 40 85 60 80 Q 80 75 100 80 Q 120 85 140 80 Q 160 75 180 80"
          stroke="#CBD5E1"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M 20 110 Q 40 115 60 110 Q 80 105 100 110 Q 120 115 140 110 Q 160 105 180 110"
          stroke="#CBD5E1"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          opacity="0.7"
        />
        <path
          d="M 20 140 Q 40 145 60 140 Q 80 135 100 140 Q 120 145 140 140 Q 160 135 180 140"
          stroke="#CBD5E1"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          opacity="0.5"
        />
      </svg>
    )
  }

  if (conditionLower.includes("storm") || conditionLower.includes("thunder")) {
    return (
      <svg width={size} height={size} viewBox="0 0 200 200" className="drop-shadow-lg">
        {/* Storm cloud */}
        <path
          d="M 30 90 Q 20 90 15 80 Q 15 65 30 60 Q 35 50 50 50 Q 65 50 75 60 Q 90 60 100 70 Q 105 60 115 60 Q 135 60 140 80 Q 145 90 135 95 Z"
          fill="#1F2937"
        />
        {/* Lightning bolt */}
        <path d="M 100 100 L 95 130 L 105 130 L 85 165 L 115 110 L 105 110 Z" fill="#FBBF24" />
      </svg>
    )
  }

  return (
    <svg width={size} height={size} viewBox="0 0 200 200" className="drop-shadow-lg">
      <circle cx="70" cy="80" r="35" fill="#FBBF24" />
      <path
        d="M 90 110 Q 80 110 75 100 Q 75 85 90 80 Q 95 70 110 70 Q 125 70 135 80 Q 150 80 160 90 Q 165 100 155 105 Z"
        fill="#E5E7EB"
      />
    </svg>
  )
}
