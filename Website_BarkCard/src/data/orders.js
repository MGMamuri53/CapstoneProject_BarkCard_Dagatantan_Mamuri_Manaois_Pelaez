// Orders mapped to tbl_order and tbl_orderdetails schema
export const initialOrders = [
  {
    Ov_ID: 1,
    Uv_ID: 'STU-2024-001',
    Uv_FullName: 'Alexander Chen',
    Uv_Email: 'alexander.chen@university.edu',
    Uv_Phone: '+63 917 123 4567',
    Uv_Image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDGYyIQxVoeGBuoOUtJUDb16dHvMvYkG60DtrUzMsaXKAQ1sjh3Fi9sQQKYqRGhNmtEyTYL7Ka9fGnFEdjmfvQY1qzPLw-1i-sv_XGQUUFp2Nl9DromD1INCNgJw1pfjE7pl3RNv2PFxLZO2_ZcIcAPaomwU0VrZkCNg9XqEe9GJECATiDwnjnKrbgGfn95pxdi4CyQotrn6CFBOGZ0oHdOm_DHvybwDZh4QV9m3vrmz9wyNoSrQdpPdf1UXOG1tD5MN3SklvFIeWsf',
    Ov_TotalAmount: 14.50,
    Ov_CreatedAt: 'Oct 24, 11:32 AM',
    Ov_Status: 'Pending',
    Ov_Type: 'NFC',
    Ov_IsPaid: false,
    WTv_Type: 'BarkCard Balance',
    Ov_SpecialInstructions: 'Extra spicy please',
    ODv_Items: [
      { ODv_ID: 1, SPv_Name: 'Quinoa Bowl', ODv_Quantity: 1, ODv_Subtotal: 12.00 },
      { ODv_ID: 2, SPv_Name: 'Green Tea', ODv_Quantity: 1, ODv_Subtotal: 2.50 }
    ]
  },
  {
    Ov_ID: 2,
    Uv_ID: 'STU-2024-002',
    Uv_FullName: 'Maya Rodriguez',
    Uv_Email: 'maya.rodriguez@university.edu',
    Uv_Phone: '+63 917 234 5678',
    Uv_Image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBXYs7HeIx3jmfjqVDVs6O2uqm0LNu8xg1atLjpy1a-9DmIWxiHjNNktAij3ckt0oSVJVcOqJcGe3d6r1_XEmEgqwvDOsbtbibuSZz0gmM7tlg6QHOuOlYGVmrtcAxcf4-vz7T8S_B6oEy9P9i5kPaxz2iZyySDRTiLOTpASO2r13VzmVe4hM8RS1g6nwjsxs70y_6Of7v9UWMLVMLVdH5EOMhRpsRrZJc1rs0pQ4PLtsWeQrtUGI_AwY_8vwfc-EFGAUC6916Icfqk',
    Ov_TotalAmount: 18.25,
    Ov_CreatedAt: 'Oct 24, 11:28 AM',
    Ov_Status: 'Preparing',
    Ov_Type: 'NFC',
    Ov_IsPaid: true,
    WTv_Type: 'Cash',
    Ov_SpecialInstructions: 'No onions',
    ODv_Items: [
      { ODv_ID: 3, SPv_Name: 'Double Cheeseburger', ODv_Quantity: 1, ODv_Subtotal: 15.00 },
      { ODv_ID: 4, SPv_Name: 'Fries', ODv_Quantity: 1, ODv_Subtotal: 3.25 }
    ]
  },
  {
    Ov_ID: 3,
    Uv_ID: 'STU-2024-003',
    Uv_FullName: 'Liam O\'Connor',
    Uv_Email: 'liam.oconnor@university.edu',
    Uv_Phone: '+63 917 345 6789',
    Uv_Image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDcfWBviL48HTPXj-qtk4rZ1G5v6EWgPkciCarX-o-ip9iXncBelRVOCv9zGgkratT5mY4pKzrSVG66z72sVuC-X8rRhzxmGzqEens_0SH7cUnIBogs4VyOylmDbg2Xqz00A3VjVf5azcpjllvDkxpGlm_CSlgMZ3-mhjp275Tc4IcD0gwr6L-0-V5gGJXF3Bk4z9CP1ZIo-mDPJM7t1UEQ7lJiAA3SyW1A2kuwUPOehGLit7a-EM3Fh0wauYYtl6nlczXkEP5-QlSf',
    Ov_TotalAmount: 12.00,
    Ov_CreatedAt: 'Oct 24, 11:15 AM',
    Ov_Status: 'Ready',
    Ov_Type: 'NFC',
    Ov_IsPaid: false,
    WTv_Type: 'BarkCard Balance',
    Ov_SpecialInstructions: 'Dressing on the side',
    ODv_Items: [
      { ODv_ID: 5, SPv_Name: 'Caesar Salad', ODv_Quantity: 1, ODv_Subtotal: 10.00 },
      { ODv_ID: 6, SPv_Name: 'Apple', ODv_Quantity: 1, ODv_Subtotal: 2.00 }
    ]
  },
  {
    Ov_ID: 4,
    Uv_ID: 'STU-2024-004',
    Uv_FullName: 'Sophia Patel',
    Uv_Email: 'sophia.patel@university.edu',
    Uv_Phone: '+63 917 456 7890',
    Uv_Image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDGYyIQxVoeGBuoOUtJUDb16dHvMvYkG60DtrUzMsaXKAQ1sjh3Fi9sQQKYqRGhNmtEyTYL7Ka9fGnFEdjmfvQY1qzPLw-1i-sv_XGQUUFp2Nl9DromD1INCNgJw1pfjE7pl3RNv2PFxLZO2_ZcIcAPaomwU0VrZkCNg9XqEe9GJECATiDwnjnKrbgGfn95pxdi4CyQotrn6CFBOGZ0oHdOm_DHvybwDZh4QV9m3vrmz9wyNoSrQdpPdf1UXOG1tD5MN3SklvFIeWsf',
    Ov_TotalAmount: 13.75,
    Ov_CreatedAt: 'Oct 24, 10:45 AM',
    Ov_Status: 'Completed',
    Ov_Type: 'NFC',
    Ov_IsPaid: false,
    WTv_Type: 'BarkCard Balance',
    Ov_SpecialInstructions: 'Extra veggies',
    ODv_Items: [
      { ODv_ID: 7, SPv_Name: 'Veggie Wrap', ODv_Quantity: 1, ODv_Subtotal: 11.00 },
      { ODv_ID: 8, SPv_Name: 'Orange Juice', ODv_Quantity: 1, ODv_Subtotal: 2.75 }
    ]
  },
  {
    Ov_ID: 5,
    Uv_ID: 'STU-2024-005',
    Uv_FullName: 'Ethan Kim',
    Uv_Email: 'ethan.kim@university.edu',
    Uv_Phone: '+63 917 567 8901',
    Uv_Image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBXYs7HeIx3jmfjqVDVs6O2uqm0LNu8xg1atLjpy1a-9DmIWxiHjNNktAij3ckt0oSVJVcOqJcGe3d6r1_XEmEgqwvDOsbtbibuSZz0gmM7tlg6QHOuOlYGVmrtcAxcf4-vz7T8S_B6oEy9P9i5kPaxz2iZyySDRTiLOTpASO2r13VzmVe4hM8RS1g6nwjsxs70y_6Of7v9UWMLVMLVdH5EOMhRpsRrZJc1rs0pQ4PLtsWeQrtUGI_AwY_8vwfc-EFGAUC6916Icfqk',
    Ov_TotalAmount: 16.00,
    Ov_CreatedAt: 'Oct 24, 10:30 AM',
    Ov_Status: 'Cancelled',
    Ov_Type: 'NFC',
    Ov_IsPaid: true,
    WTv_Type: 'Cash',
    Ov_SpecialInstructions: 'Cancelled due to dietary restrictions',
    ODv_Items: [
      { ODv_ID: 9, SPv_Name: 'Chicken Sandwich', ODv_Quantity: 1, ODv_Subtotal: 13.00 },
      { ODv_ID: 10, SPv_Name: 'Coffee', ODv_Quantity: 1, ODv_Subtotal: 3.00 }
    ]
  }
];