import { Fraunces, Inter } from 'next/font/google';

/**
 * Shared between the two root layouts (§4.3).
 *
 * Both faces carry `latin-ext`, which is a hard requirement: without it
 * č ć đ š ž fall back mid-word and the Croatian copy looks broken.
 * Test string — "Šišanje, češljanje i njega kose — Đurđica Žužić".
 */
export const fraunces = Fraunces({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-fraunces',
  axes: ['SOFT', 'WONK'],
});

export const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-inter',
});

export const fontVariables = `${fraunces.variable} ${inter.variable}`;

/**
 * Brand-level structured data, shared by both locales.
 *
 * Each location page carries its **own** HairSalon block with its own address,
 * geo and hours — never this one copied seven times with the district swapped
 * (§14.3).
 */
export const ORGANISATION_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'HairSalon',
  '@id': 'https://studiomarcela.hr/#salon',
  name: 'Studio Marcela',
  alternateName: 'Frizerski salon Studio Marcela',
  url: 'https://studiomarcela.hr',
  slogan: 'Ne prodajemo frizure. Gradimo povjerenje — rez po rez, boja po boja.',
  founder: { '@type': 'Person', name: 'Jadranka Pezo' },
  areaServed: [
    { '@type': 'City', name: 'Zagreb' },
    { '@type': 'City', name: 'Dubrovnik' },
  ],
};
