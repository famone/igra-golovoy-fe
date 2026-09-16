<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import UIButton from '@/components/ui/UIButton.vue';
import UiInput from '@/components/ui/UiInput.vue';
import UiSheet from '@/components/ui/UiSheet.vue';
import { useArenaStore } from '@/stores/arena';

/** Вход в закрытую комнату по коду из приглашения. */
const open = defineModel<boolean>({ default: false });

const router = useRouter();
const arenaStore = useArenaStore();

const code = ref('');
const error = ref('');
const loading = ref(false);

watch(open, (isOpen) => {
  if (isOpen) return;
  code.value = '';
  error.value = '';
});

async function submit() {
  error.value = '';
  const normalized = code.value.trim();

  if (normalized.length < 4) {
    error.value = 'Код состоит минимум из 4 символов';
    return;
  }

  loading.value = true;
  try {
    const room = await arenaStore.JOIN_BY_CODE(normalized);
    if (!room) {
      error.value = 'Комната не найдена';
      return;
    }

    open.value = false;
    void router.push({ name: 'room', params: { id: room.id } });
  }
  finally {
    loading.value = false;
  }
}
</script>

<template>
  <UiSheet
    v-model="open"
    title="Вход по коду"
  >
    <UiInput
      v-model="code"
      label="Код комнаты"
      placeholder="GOLOVA"
      :error-messages="error"
      mono
      maxlength="8"
      autocapitalize="characters"
      autocomplete="off"
    />

    <template #actions>
      <UIButton
        block
        size="large"
        :loading="loading"
        @click="submit"
      >
        Присоединиться
      </UIButton>
    </template>
  </UiSheet>
</template>
