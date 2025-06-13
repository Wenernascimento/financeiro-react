 // src/utils/date.ts

/**
 * Retorna a data atual ajustada para o horário de Brasília (UTC-3),
 * com hora zerada (00:00:00.000).
 */
export const getBrazilianDate = (): Date => {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const brasilTime = new Date(utc - 3 * 60 * 60 * 1000);
  brasilTime.setHours(0, 0, 0, 0);
  return brasilTime;
};

/**
 * Converte um objeto Date em uma string no formato ISO (yyyy-mm-dd),
 * adequado para armazenar em campos de data.
 */
export const formatDateToISOString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
