import { hanja8 } from './hanja-8';
import { hanja7s } from './hanja-7s';
import { hanja7 } from './hanja-7';
import { hanja6s } from './hanja-6s';
import { hanja6 } from './hanja-6';

export const hanjaData = {
  '8급': hanja8,
  '준7급': hanja7s,
  '7급': hanja7,
  '준6급': hanja6s,
  '6급': hanja6,
};

export const getAllHanja = () => Object.values(hanjaData).flat();
export const getHanjaByLevels = (levels) => levels.flatMap(l => hanjaData[l] || []);
