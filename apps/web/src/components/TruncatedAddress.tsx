interface TruncatedAddressProps {
  address: string;
  startLength?: number;
  endLength?: number;
}

export function TruncatedAddress({ 
  address, 
  startLength = 6, 
  endLength = 4 
}: TruncatedAddressProps) {
  if (address.length <= startLength + endLength) return address;
  
  return (
    <span title={address} className="font-mono">
      {address.slice(0, startLength)}...{address.slice(-endLength)}
    </span>
  );
} 