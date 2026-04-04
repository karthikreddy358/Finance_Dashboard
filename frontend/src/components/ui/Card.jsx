const Card = ({
  children,
  className = '',
  padding = 'normal',
  shadow = 'soft',
}) => {
  const paddingStyles = {
    none: '',
    small: 'p-4',
    normal: 'p-6',
    large: 'p-8',
  };

  const shadowStyles = {
    none: '',
    soft: 'shadow-sm',
    medium: 'shadow-md',
    large: 'shadow-lg',
  };

  return (
    <div
      className={`bg-white rounded-xl border border-gray-100 ${paddingStyles[padding]} ${shadowStyles[shadow]} ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
