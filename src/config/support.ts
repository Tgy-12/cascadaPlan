export interface PaymentChannel {
  id: string;
  category: 'local' | 'international' | 'crypto';
  name: string;
  shortDescription: string;
  accountIdentifier: string;
  recipientName?: string;
  badge: string;
  iconType: 'telebirr' | 'cbe' | 'payoneer' | 'crypto';
  qrCodeUrl?: string; // Optional image or SVG placeholder
  instructions?: string;
}

export const SUPPORT_CONFIG: {
  title: string;
  subtitle: string;
  channels: PaymentChannel[];
} = {
  title: 'Support CascadePlan',
  subtitle:
    'CascadePlan is 100% free, zero-tracking, and open-source. If this tool boosts your daily focus and long-term vision, feel free to buy me a coffee!',
  channels: [
    {
      id: 'telebirr',
      category: 'local',
      name: 'Telebirr (Ethiopia)',
      shortDescription: 'Mobile payment via Telebirr app or USSD',
      accountIdentifier: '+251999825186',
      recipientName: 'Tsegay Araya',
      badge: 'Local (ET)',
      iconType: 'telebirr',
      instructions: 'Send money to this phone number via Telebirr.',
    },
    {
      id: 'cbe',
      category: 'local',
      name: 'CBE (Commercial Bank of Ethiopia)',
      shortDescription: 'Direct bank transfer or CBE Birr',
      accountIdentifier: '1000323672648',
      recipientName: 'Tsegay Araya',
      badge: 'Local (ET)',
      iconType: 'cbe',
      instructions: 'Deposit or mobile transfer using CBE Birr / CBE Mobile Banking.',
    },
    {
      id: 'payoneer',
      category: 'international',
      name: 'Payoneer',
      shortDescription: 'International developer & freelancer transfer',
      accountIdentifier: 'tgyare23@gmail.com',
      recipientName: 'Tsegay Araya',
      badge: 'International',
      iconType: 'payoneer',
      instructions: 'Send USD/EUR payment to this Payoneer registered email.',
    },
    {
      id: 'usdt-trc20',
      category: 'crypto',
      name: 'USDT (TRC-20)',
      shortDescription: 'Tether USD on Tron Network (Ultra-low fee)',
      accountIdentifier: 'TTQYE46PMH8oci7Tj4dF1CwyQsqeDcHa1U',
      badge: 'Crypto',
      iconType: 'crypto',
      instructions: 'Send USDT via TRON network (TRC-20) only.',
    },
    {
      id: 'usdt-erc20',
      category: 'crypto',
      name: 'USDT / ETH (ERC-20 & Arbitrum)',
      shortDescription: 'Ethereum / Arbitrum / Polygon EVM address',
      accountIdentifier: '0xb4dad983052b4b09c3c4dbb8c5eb6d58a45b4e67',
      badge: 'Crypto',
      iconType: 'crypto',
      instructions: 'Send ETH or USDT via Ethereum, Arbitrum, or Polygon network.',
    },
  ],
};
