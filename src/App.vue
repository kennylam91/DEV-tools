<script setup lang="ts">
const items = ref([
  {
    label: 'Home',
    icon: 'pi pi-home',
    route: '/'
  },
  {
    label: 'Work Log',
    icon: 'pi pi-bookmark',
    route: '/work-logs'
  },
  {
    label: 'Base64',
    items: [
      { label: 'Encode', route: '/base64/encode' },
      {
        label: 'Decode',
        route: '/base64/decode'
      }
    ]
  },
  {
    label: 'Sbom',
    items: [
      { label: 'Relationship', route: '/sbom/relationship' },
      { label: 'Compare', route: '/sbom/compare' }
    ]
  },
  {
    label: 'External request',
    items: [{ label: 'Deps.dev', route: '/external-request/deps-dev' }]
  },
  {
    label: 'Mongodb',
    items: [{ label: 'Query tool', route: '/mongodb/query-tool' }]
  }
])

defineProps<{}>()
</script>

<template>
  <div class="flex gap-5 px-5 py-5 bg-gray-100 min-h-screen">
    <Menu :model="items">
      <template #item="{ item, props }">
        <router-link v-if="item.route" v-slot="{ href, navigate }" :to="item.route" custom>
          <a v-ripple :href="href" v-bind="props.action" @click="navigate">
            <span :class="item.icon" />
            <span class="ml-2">{{ item.label }}</span>
          </a>
        </router-link>
        <a v-else v-ripple :href="item.url" :target="item.target" v-bind="props.action">
          <span :class="item.icon" />
          <span class="ml-2">{{ item.label }}</span>
        </a>
      </template>
    </Menu>
    <main class="flex-1">
      <RouterView />
    </main>
  </div>
</template>

<style scoped></style>
