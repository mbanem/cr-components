import { SvelteMap } from 'svelte/reactivity'
export type TCountryName = string
export type TCountryCodes = { dialCode: string, code: string }
const codes: Record<TCountryName, TCountryCodes> = {
  Afghanistan: {
    dialCode: '+93',
    code: 'AF'
  },
  'Aland Islands': {
    dialCode: '+358',
    code: 'AX'
  },
  Albania: {
    dialCode: '+355',
    code: 'AL'
  },
  Algeria: {
    dialCode: '+213',
    code: 'DZ'
  },
  AmericanSamoa: {
    dialCode: '+1684',
    code: 'AS'
  },
  Andorra: {
    dialCode: '+376',
    code: 'AD'
  },
  Angola: {
    dialCode: '+244',
    code: 'AO'
  },
  Anguilla: {
    dialCode: '+1264',
    code: 'AI'
  },
  Antarctica: {
    dialCode: '+672',
    code: 'AQ'
  },
  'Antigua and Barbuda': {
    dialCode: '+1268',
    code: 'AG'
  },
  Argentina: {
    dialCode: '+54',
    code: 'AR'
  },
  Armenia: {
    dialCode: '+374',
    code: 'AM'
  },
  Aruba: {
    dialCode: '+297',
    code: 'AW'
  },
  Australia: {
    dialCode: '+61',
    code: 'AU'
  },
  Austria: {
    dialCode: '+43',
    code: 'AT'
  },
  Azerbaijan: {
    dialCode: '+994',
    code: 'AZ'
  },
  Bahamas: {
    dialCode: '+1242',
    code: 'BS'
  },
  Bahrain: {
    dialCode: '+973',
    code: 'BH'
  },
  Bangladesh: {
    dialCode: '+880',
    code: 'BD'
  },
  Barbados: {
    dialCode: '+1246',
    code: 'BB'
  },
  Belarus: {
    dialCode: '+375',
    code: 'BY'
  },
  Belgium: {
    dialCode: '+32',
    code: 'BE'
  },
  Belize: {
    dialCode: '+501',
    code: 'BZ'
  },
  Benin: {
    dialCode: '+229',
    code: 'BJ'
  },
  Bermuda: {
    dialCode: '+1441',
    code: 'BM'
  },
  Bhutan: {
    dialCode: '+975',
    code: 'BT'
  },
  'Bolivia, Plurinational State of': {
    dialCode: '+591',
    code: 'BO'
  },
  'Bosnia and Herzegovina': {
    dialCode: '+387',
    code: 'BA'
  },
  Botswana: {
    dialCode: '+267',
    code: 'BW'
  },
  Brazil: {
    dialCode: '+55',
    code: 'BR'
  },
  'British Indian Ocean Territory': {
    dialCode: '+246',
    code: 'IO'
  },
  'Brunei Darussalam': {
    dialCode: '+673',
    code: 'BN'
  },
  Bulgaria: {
    dialCode: '+359',
    code: 'BG'
  },
  'Burkina Faso': {
    dialCode: '+226',
    code: 'BF'
  },
  Burundi: {
    dialCode: '+257',
    code: 'BI'
  },
  Cambodia: {
    dialCode: '+855',
    code: 'KH'
  },
  Cameroon: {
    dialCode: '+237',
    code: 'CM'
  },
  Canada: {
    dialCode: '+1',
    code: 'CA'
  },
  'Cape Verde': {
    dialCode: '+238',
    code: 'CV'
  },
  'Cayman Islands': {
    dialCode: '+ 345',
    code: 'KY'
  },
  'Central African Republic': {
    dialCode: '+236',
    code: 'CF'
  },
  Chad: {
    dialCode: '+235',
    code: 'TD'
  },
  Chile: {
    dialCode: '+56',
    code: 'CL'
  },
  China: {
    dialCode: '+86',
    code: 'CN'
  },
  'Christmas Island': {
    dialCode: '+61',
    code: 'CX'
  },
  'Cocos (Keeling) Islands': {
    dialCode: '+61',
    code: 'CC'
  },
  Colombia: {
    dialCode: '+57',
    code: 'CO'
  },
  Comoros: {
    dialCode: '+269',
    code: 'KM'
  },
  Congo: {
    dialCode: '+242',
    code: 'CG'
  },
  'Congo, The Democratic Republic of the Congo': {
    dialCode: '+243',
    code: 'CD'
  },
  'Cook Islands': {
    dialCode: '+682',
    code: 'CK'
  },
  'Costa Rica': {
    dialCode: '+506',
    code: 'CR'
  },
  "Cote d'Ivoire": {
    dialCode: '+225',
    code: 'CI'
  },
  Croatia: {
    dialCode: '+385',
    code: 'HR'
  },
  Cuba: {
    dialCode: '+53',
    code: 'CU'
  },
  Cyprus: {
    dialCode: '+357',
    code: 'CY'
  },
  'Czech Republic': {
    dialCode: '+420',
    code: 'CZ'
  },
  Denmark: {
    dialCode: '+45',
    code: 'DK'
  },
  Djibouti: {
    dialCode: '+253',
    code: 'DJ'
  },
  Dominica: {
    dialCode: '+1767',
    code: 'DM'
  },
  'Dominican Republic': {
    dialCode: '+1849',
    code: 'DO'
  },
  Ecuador: {
    dialCode: '+593',
    code: 'EC'
  },
  Egypt: {
    dialCode: '+20',
    code: 'EG'
  },
  'El Salvador': {
    dialCode: '+503',
    code: 'SV'
  },
  'Equatorial Guinea': {
    dialCode: '+240',
    code: 'GQ'
  },
  Eritrea: {
    dialCode: '+291',
    code: 'ER'
  },
  Estonia: {
    dialCode: '+372',
    code: 'EE'
  },
  Ethiopia: {
    dialCode: '+251',
    code: 'ET'
  },
  'Falkland Islands (Malvinas)': {
    dialCode: '+500',
    code: 'FK'
  },
  'Faroe Islands': {
    dialCode: '+298',
    code: 'FO'
  },
  Fiji: {
    dialCode: '+679',
    code: 'FJ'
  },
  Finland: {
    dialCode: '+358',
    code: 'FI'
  },
  France: {
    dialCode: '+33',
    code: 'FR'
  },
  'French Guiana': {
    dialCode: '+594',
    code: 'GF'
  },
  'French Polynesia': {
    dialCode: '+689',
    code: 'PF'
  },
  Gabon: {
    dialCode: '+241',
    code: 'GA'
  },
  Gambia: {
    dialCode: '+220',
    code: 'GM'
  },
  Georgia: {
    dialCode: '+995',
    code: 'GE'
  },
  Germany: {
    dialCode: '+49',
    code: 'DE'
  },
  Ghana: {
    dialCode: '+233',
    code: 'GH'
  },
  Gibraltar: {
    dialCode: '+350',
    code: 'GI'
  },
  Greece: {
    dialCode: '+30',
    code: 'GR'
  },
  Greenland: {
    dialCode: '+299',
    code: 'GL'
  },
  Grenada: {
    dialCode: '+1473',
    code: 'GD'
  },
  Guadeloupe: {
    dialCode: '+590',
    code: 'GP'
  },
  Guam: {
    dialCode: '+1671',
    code: 'GU'
  },
  Guatemala: {
    dialCode: '+502',
    code: 'GT'
  },
  Guernsey: {
    dialCode: '+44',
    code: 'GG'
  },
  Guinea: {
    dialCode: '+224',
    code: 'GN'
  },
  'Guinea-Bissau': {
    dialCode: '+245',
    code: 'GW'
  },
  Guyana: {
    dialCode: '+595',
    code: 'GY'
  },
  Haiti: {
    dialCode: '+509',
    code: 'HT'
  },
  'Holy See (Vatican City State)': {
    dialCode: '+379',
    code: 'VA'
  },
  Honduras: {
    dialCode: '+504',
    code: 'HN'
  },
  'Hong Kong': {
    dialCode: '+852',
    code: 'HK'
  },
  Hungary: {
    dialCode: '+36',
    code: 'HU'
  },
  Iceland: {
    dialCode: '+354',
    code: 'IS'
  },
  India: {
    dialCode: '+91',
    code: 'IN'
  },
  Indonesia: {
    dialCode: '+62',
    code: 'ID'
  },
  'Iran, Islamic Republic of Persian Gulf': {
    dialCode: '+98',
    code: 'IR'
  },
  Iraq: {
    dialCode: '+964',
    code: 'IQ'
  },
  Ireland: {
    dialCode: '+353',
    code: 'IE'
  },
  'Isle of Man': {
    dialCode: '+44',
    code: 'IM'
  },
  Israel: {
    dialCode: '+972',
    code: 'IL'
  },
  Italy: {
    dialCode: '+39',
    code: 'IT'
  },
  Jamaica: {
    dialCode: '+1876',
    code: 'JM'
  },
  Japan: {
    dialCode: '+81',
    code: 'JP'
  },
  Jersey: {
    dialCode: '+44',
    code: 'JE'
  },
  Jordan: {
    dialCode: '+962',
    code: 'JO'
  },
  Kazakhstan: {
    dialCode: '+77',
    code: 'KZ'
  },
  Kenya: {
    dialCode: '+254',
    code: 'KE'
  },
  Kiribati: {
    dialCode: '+686',
    code: 'KI'
  },
  "Korea, Democratic People's Republic of Korea": {
    dialCode: '+850',
    code: 'KP'
  },
  'Korea, Republic of South Korea': {
    dialCode: '+82',
    code: 'KR'
  },
  Kuwait: {
    dialCode: '+965',
    code: 'KW'
  },
  Kyrgyzstan: {
    dialCode: '+996',
    code: 'KG'
  },
  Laos: {
    dialCode: '+856',
    code: 'LA'
  },
  Latvia: {
    dialCode: '+371',
    code: 'LV'
  },
  Lebanon: {
    dialCode: '+961',
    code: 'LB'
  },
  Lesotho: {
    dialCode: '+266',
    code: 'LS'
  },
  Liberia: {
    dialCode: '+231',
    code: 'LR'
  },
  'Libyan Arab Jamahiriya': {
    dialCode: '+218',
    code: 'LY'
  },
  Liechtenstein: {
    dialCode: '+423',
    code: 'LI'
  },
  Lithuania: {
    dialCode: '+370',
    code: 'LT'
  },
  Luxembourg: {
    dialCode: '+352',
    code: 'LU'
  },
  Macao: {
    dialCode: '+853',
    code: 'MO'
  },
  Macedonia: {
    dialCode: '+389',
    code: 'MK'
  },
  Madagascar: {
    dialCode: '+261',
    code: 'MG'
  },
  Malawi: {
    dialCode: '+265',
    code: 'MW'
  },
  Malaysia: {
    dialCode: '+60',
    code: 'MY'
  },
  Maldives: {
    dialCode: '+960',
    code: 'MV'
  },
  Mali: {
    dialCode: '+223',
    code: 'ML'
  },
  Malta: {
    dialCode: '+356',
    code: 'MT'
  },
  'Marshall Islands': {
    dialCode: '+692',
    code: 'MH'
  },
  Martinique: {
    dialCode: '+596',
    code: 'MQ'
  },
  Mauritania: {
    dialCode: '+222',
    code: 'MR'
  },
  Mauritius: {
    dialCode: '+230',
    code: 'MU'
  },
  Mayotte: {
    dialCode: '+262',
    code: 'YT'
  },
  Mexico: {
    dialCode: '+52',
    code: 'MX'
  },
  'Micronesia, Federated States of Micronesia': {
    dialCode: '+691',
    code: 'FM'
  },
  Moldova: {
    dialCode: '+373',
    code: 'MD'
  },
  Monaco: {
    dialCode: '+377',
    code: 'MC'
  },
  Mongolia: {
    dialCode: '+976',
    code: 'MN'
  },
  Montenegro: {
    dialCode: '+382',
    code: 'ME'
  },
  Montserrat: {
    dialCode: '+1664',
    code: 'MS'
  },
  Morocco: {
    dialCode: '+212',
    code: 'MA'
  },
  Mozambique: {
    dialCode: '+258',
    code: 'MZ'
  },
  Myanmar: {
    dialCode: '+95',
    code: 'MM'
  },
  Namibia: {
    dialCode: '+264',
    code: 'NA'
  },
  Nauru: {
    dialCode: '+674',
    code: 'NR'
  },
  Nepal: {
    dialCode: '+977',
    code: 'NP'
  },
  Netherlands: {
    dialCode: '+31',
    code: 'NL'
  },
  'Netherlands Antilles': {
    dialCode: '+599',
    code: 'AN'
  },
  'New Caledonia': {
    dialCode: '+687',
    code: 'NC'
  },
  'New Zealand': {
    dialCode: '+64',
    code: 'NZ'
  },
  Nicaragua: {
    dialCode: '+505',
    code: 'NI'
  },
  Niger: {
    dialCode: '+227',
    code: 'NE'
  },
  Nigeria: {
    dialCode: '+234',
    code: 'NG'
  },
  Niue: {
    dialCode: '+683',
    code: 'NU'
  },
  'Norfolk Island': {
    dialCode: '+672',
    code: 'NF'
  },
  'Northern Mariana Islands': {
    dialCode: '+1670',
    code: 'MP'
  },
  Norway: {
    dialCode: '+47',
    code: 'NO'
  },
  Oman: {
    dialCode: '+968',
    code: 'OM'
  },
  Pakistan: {
    dialCode: '+92',
    code: 'PK'
  },
  Palau: {
    dialCode: '+680',
    code: 'PW'
  },
  'Palestinian Territory, Occupied': {
    dialCode: '+970',
    code: 'PS'
  },
  Panama: {
    dialCode: '+507',
    code: 'PA'
  },
  'Papua New Guinea': {
    dialCode: '+675',
    code: 'PG'
  },
  Paraguay: {
    dialCode: '+595',
    code: 'PY'
  },
  Peru: {
    dialCode: '+51',
    code: 'PE'
  },
  Philippines: {
    dialCode: '+63',
    code: 'PH'
  },
  Pitcairn: {
    dialCode: '+872',
    code: 'PN'
  },
  Poland: {
    dialCode: '+48',
    code: 'PL'
  },
  Portugal: {
    dialCode: '+351',
    code: 'PT'
  },
  'Puerto Rico': {
    dialCode: '+1939',
    code: 'PR'
  },
  Qatar: {
    dialCode: '+974',
    code: 'QA'
  },
  Romania: {
    dialCode: '+40',
    code: 'RO'
  },
  Russia: {
    dialCode: '+7',
    code: 'RU'
  },
  Rwanda: {
    dialCode: '+250',
    code: 'RW'
  },
  Reunion: {
    dialCode: '+262',
    code: 'RE'
  },
  'Saint Barthelemy': {
    dialCode: '+590',
    code: 'BL'
  },
  'Saint Helena, Ascension and Tristan Da Cunha': {
    dialCode: '+290',
    code: 'SH'
  },
  'Saint Kitts and Nevis': {
    dialCode: '+1869',
    code: 'KN'
  },
  'Saint Lucia': {
    dialCode: '+1758',
    code: 'LC'
  },
  'Saint Martin': {
    dialCode: '+590',
    code: 'MF'
  },
  'Saint Pierre and Miquelon': {
    dialCode: '+508',
    code: 'PM'
  },
  'Saint Vincent and the Grenadines': {
    dialCode: '+1784',
    code: 'VC'
  },
  Samoa: {
    dialCode: '+685',
    code: 'WS'
  },
  'San Marino': {
    dialCode: '+378',
    code: 'SM'
  },
  'Sao Tome and Principe': {
    dialCode: '+239',
    code: 'ST'
  },
  'Saudi Arabia': {
    dialCode: '+966',
    code: 'SA'
  },
  Senegal: {
    dialCode: '+221',
    code: 'SN'
  },
  Serbia: {
    dialCode: '+381',
    code: 'RS'
  },
  Seychelles: {
    dialCode: '+248',
    code: 'SC'
  },
  'Sierra Leone': {
    dialCode: '+232',
    code: 'SL'
  },
  Singapore: {
    dialCode: '+65',
    code: 'SG'
  },
  Slovakia: {
    dialCode: '+421',
    code: 'SK'
  },
  Slovenia: {
    dialCode: '+386',
    code: 'SI'
  },
  'Solomon Islands': {
    dialCode: '+677',
    code: 'SB'
  },
  Somalia: {
    dialCode: '+252',
    code: 'SO'
  },
  'South Africa': {
    dialCode: '+27',
    code: 'ZA'
  },
  'South Sudan': {
    dialCode: '+211',
    code: 'SS'
  },
  'South Georgia and the South Sandwich Islands': {
    dialCode: '+500',
    code: 'GS'
  },
  Spain: {
    dialCode: '+34',
    code: 'ES'
  },
  'Sri Lanka': {
    dialCode: '+94',
    code: 'LK'
  },
  Sudan: {
    dialCode: '+249',
    code: 'SD'
  },
  Suriname: {
    dialCode: '+597',
    code: 'SR'
  },
  'Svalbard and Jan Mayen': {
    dialCode: '+47',
    code: 'SJ'
  },
  Swaziland: {
    dialCode: '+268',
    code: 'SZ'
  },
  Sweden: {
    dialCode: '+46',
    code: 'SE'
  },
  Switzerland: {
    dialCode: '+41',
    code: 'CH'
  },
  'Syrian Arab Republic': {
    dialCode: '+963',
    code: 'SY'
  },
  Taiwan: {
    dialCode: '+886',
    code: 'TW'
  },
  Tajikistan: {
    dialCode: '+992',
    code: 'TJ'
  },
  'Tanzania, United Republic of Tanzania': {
    dialCode: '+255',
    code: 'TZ'
  },
  Thailand: {
    dialCode: '+66',
    code: 'TH'
  },
  'Timor-Leste': {
    dialCode: '+670',
    code: 'TL'
  },
  Togo: {
    dialCode: '+228',
    code: 'TG'
  },
  Tokelau: {
    dialCode: '+690',
    code: 'TK'
  },
  Tonga: {
    dialCode: '+676',
    code: 'TO'
  },
  'Trinidad and Tobago': {
    dialCode: '+1868',
    code: 'TT'
  },
  Tunisia: {
    dialCode: '+216',
    code: 'TN'
  },
  Turkey: {
    dialCode: '+90',
    code: 'TR'
  },
  Turkmenistan: {
    dialCode: '+993',
    code: 'TM'
  },
  'Turks and Caicos Islands': {
    dialCode: '+1649',
    code: 'TC'
  },
  Tuvalu: {
    dialCode: '+688',
    code: 'TV'
  },
  Uganda: {
    dialCode: '+256',
    code: 'UG'
  },
  Ukraine: {
    dialCode: '+380',
    code: 'UA'
  },
  'United Arab Emirates': {
    dialCode: '+971',
    code: 'AE'
  },
  'United Kingdom': {
    dialCode: '+44',
    code: 'GB'
  },
  'United States': {
    dialCode: '+1',
    code: 'US'
  },
  Uruguay: {
    dialCode: '+598',
    code: 'UY'
  },
  Uzbekistan: {
    dialCode: '+998',
    code: 'UZ'
  },
  Vanuatu: {
    dialCode: '+678',
    code: 'VU'
  },
  'Venezuela, Bolivarian Republic of Venezuela': {
    dialCode: '+58',
    code: 'VE'
  },
  Vietnam: {
    dialCode: '+84',
    code: 'VN'
  },
  'Virgin Islands, British': {
    dialCode: '+1284',
    code: 'VG'
  },
  'Virgin Islands, U.S.': {
    dialCode: '+1340',
    code: 'VI'
  },
  'Wallis and Futuna': {
    dialCode: '+681',
    code: 'WF'
  },
  Yemen: {
    dialCode: '+967',
    code: 'YE'
  },
  Zambia: {
    dialCode: '+260',
    code: 'ZM'
  },
  Zimbabwe: {
    dialCode: '+263',
    code: 'ZW'
  }
};
let countryCodesMap: SvelteMap<TCountryName, TCountryCodes>;

export function getCountryCodesMap() {
  if (!countryCodesMap) {
    countryCodesMap = new SvelteMap<TCountryName, TCountryCodes>()
  }
  for (const [k, { dialCode, code }] of Object.entries(codes)) {
    countryCodesMap.set(k, { dialCode, code });
  }
  console.log('getCountryCodesMap returns')
  return countryCodesMap
}

// export function getFrequences(leadingChars: number) {
//   if (!leadingChars || leadingChars < 2 || leadingChars > 4) {
//     console.error('getFrequences accept leadingChars argument in range 2-4')
//     return undefined
//   }
//   const tempFreq = new Map<string, number>();
//   console.log('getFrequences')
//   for (const countryName of Object.keys(codes)) {
//     console.log('countryName', countryName)
//     // Get the first letters and normalize them (e.g., to lowercase)
//     const nLetters = countryName.substring(0, leadingChars).toLowerCase();

//     tempFreq.set(nLetters, (tempFreq.get(nLetters) || 0) + 1);
//   }
//   const entries = Array.from(tempFreq.entries().filter((el) => el[1] > 1));

//   // 2. Sort the array by value (frequency) in descending order
//   entries.sort((a, b) => b[1] - a[1]);

//   // 2. Convert to SvelteMap
//   // SvelteMap constructor accepts an iterable of [key, value] pairs
//   return new SvelteMap<string, number>(entries);

// }