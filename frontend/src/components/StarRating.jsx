const StarRating = ({ value, onChange, readonly = false, size = 'md' }) => {
  const sizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
  };

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange && onChange(star)}
          className={`${sizes[size]} transition-transform ${
            readonly ? 'cursor-default' : 'cursor-pointer hover:scale-125'
          }`}>
          <span className={star <= value ? 'text-amber-400' : 'text-gray-200'}>
            ★
          </span>
        </button>
      ))}
    </div>
  );
};

export default StarRating;