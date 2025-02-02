interface TruncatedAddressProps {
  address: string;
  startLength?: number;
  endLength?: number;
  className?: string;
}

export const TruncatedAddress: React.FC<TruncatedAddressProps> = ({ 
  address, 
  startLength = 6, 
  endLength = 4,
  className
}) => {
  if (address.length <= startLength + endLength) return address;
  
  return (
    <span title={address} className={`font-mono ${className}`}>
      {address.slice(0, startLength)}...{address.slice(-endLength)}
    </span>
  );
}; 