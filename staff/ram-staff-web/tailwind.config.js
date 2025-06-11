/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Identité RAM officielle
        ramRed: '#C4002A',           // Rouge principal
        ramRedDark: '#A3001B',       // Rouge foncé
        ramRedLight: '#F8E6EA',      // Rouge très pâle (hover, alt, badge)
        ramBeige: '#F7F3EE',         // Fond beige RAM officiel (site)
        ramBeige2: '#F6EFE7',        // Beige secondaire
        ramWhite: '#FFFFFF',         // Fond blanc
        ramGray: '#ECECEC',          // Gris clair RAM
        ramGrayDark: '#D1D1D1',      // Gris dashboard/border
        ramText: '#1A1A1A',          // Texte principal RAM
        ramTextSoft: '#656565',      // Texte secondaire doux
      },
      fontFamily: {
        sans: ['Montserrat', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        subtle: '0 1px 8px 0 rgba(60,60,60,0.05)',
        nav: '0 1px 14px 0 rgba(60,0,0,0.06)',
        search: '0 2px 8px 0 rgba(196,0,42,0.03)',
        sidebar: '2px 0 16px 0 rgba(196,0,42,0.04)',
      },
      borderRadius: {
        xl: '1rem',
        lg: '0.65rem',
        md: '0.45rem',
        sm: '0.20rem',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(28px)' },
          '100%': { opacity: '1', transform: 'none' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        pop: {
          '0%': { transform: 'scale(0.98)' },
          '60%': { transform: 'scale(1.03)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      animation: {
        fadeInUp: 'fadeInUp 0.7s cubic-bezier(0.23,1,0.32,1) both',
        fadeIn: 'fadeIn 0.45s cubic-bezier(.23,1,.32,1) both',
        pop: 'pop 0.33s cubic-bezier(.36,2.01,.32,.99) both',
      },
      transitionProperty: {
        colors: 'color, background-color, border-color, text-decoration-color, fill, stroke',
        spacing: 'margin, padding, gap',
        shadow: 'box-shadow',
        ring: 'box-shadow',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
}
