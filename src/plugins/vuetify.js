import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { md } from 'vuetify/iconsets/md'
import { aliases, mdi } from 'vuetify/iconsets/mdi'

export const vuetify = createVuetify({
  directives,
  components: {
    ...components,
  },
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: { md, mdi },
  },
  theme: {
    defaultTheme: 'light',
  },
})