/**
 * 100,off4
 * 70000,whi4
 */
export const parsePresetTimeline = () => {};

/**
 * 100,off4
 * 70000,whi4
 */
export const parseRawPresetFile = (content: string) => {
  const presetLines = content
    .split("\n")
    .map((line) => {
      if (!line) {
        return undefined;
      }
      // 100,off4
      const timeLineRegex = /^(\d+)00,(\w+(\d)?)$/g;
      const extract = timeLineRegex.exec(line);
      if (!extract) {
        return undefined;
      }
      // 十分之一秒为一个单位 (100ms)s
      const timeCentSecond = extract[1];
      const lightText = extract[2];
      let light = ["off4", "#333333", "DFBA78C50667A6ED7267221C44943F13"]; // off4
      [...m, x, b].some((lightLine) => {
        return lightLine.find((lightConfig) => {
          const isMatch = lightConfig[0] === light[0];
          if (isMatch) {
            light = lightConfig;
          }
          return isMatch;
        });
      });
      return {
        timeCentSecond,
        light,
      };
    })
    .filter((line) => line);
  return presetLines;
};

/**
 * from mayblue mini-program, what is the purpose the 3rd value?
 */
export const m = [
  [
    ["red4", "#ef4444", "C06A0B4AFA9862FCF8BF234227AC2BAF"],
    ["red3", "#f87171", "14EFBDA39BC5C9B24961A70766D1480A"],
    ["red2", "#fca5a5", "9CF0CD27DA9E528AA9A22375AC5320BA"],
    ["red1", "#fecaca", "C0415C7616A02F4859E0E970CA44B1D0"],
  ],
  [
    ["ora4", "#f97316", "C597389AC758A15C5313C5AC7AEF58E9"],
    ["ora3", "#fb923c", "908E0F2509F9DF2438C16CDC367D7A9C"],
    ["ora2", "#fdba74", "0CBCF055B5558D865CC043A71504AA70"],
    ["ora1", "#fed7aa", "6091E80E977458E4708444EA4336FC6C"],
  ],
  [
    ["yel4", "#eab308", "49D82520AD9155DF815B3FD4C8150923"],
    ["yel3", "#facc15", "36286DA2036FFB942C5035DEDB27B179"],
    ["yel2", "#fde047", "7E70D3BAF56CE2925517B5BB3AC26182"],
    ["yel1", "#fef08a", "D200E2EA33CF6E73812E01622BCCE5E9"],
  ],
  [
    ["sky4", "#06b6d4", "30BE4E11E40DB45E5167251BFBCD9728"],
    ["sky3", "#22d3ee", "9A8E147E3339D33F22CDC97913EEEF1C"],
    ["sky2", "#67e8f9", "CEABFC2D7D7BAD2DEDA75F49787BA1FD"],
    ["sky1", "#a5f3fc", "8E65160329CD03907F6D43887C02DDA9"],
  ],
  [
    ["blu4", "#3b82f6", "A71D3CCAAF16185AE3EA3D6D10712AE6"],
    ["blu3", "#60a5fa", "04D93C41105952F023BA277E2DDDC68B"],
    ["blu2", "#93c5fd", "75D92ED82702CEA531ABC654BCD26A7A"],
    ["blu1", "#bfdbfe", "0DA3AF08C1D6060554736E440CE9429B"],
  ],
  [
    ["pur4", "#a855f7", "7A6EFF5A41BAAFAEFBB02D11AC90FD52"],
    ["pur3", "#c084fc", "79CF39E3257079E3FF53648F477E517A"],
    ["pur2", "#d8b4fe", "C44B22FDEC23FB31E9A13F36464B33E1"],
    ["pur1", "#e9d5ff", "B61AC34CD24892755A8849E351A53EC0"],
  ],
];
export const x = [
  ["redT", "#ef4444", "BF00368DD8072D0A3888AFAB83E6C35B"],
  ["oraT", "#f97316", "F7D8071185B68D2BB76BF90000D11370"],
  ["yelT", "#eab308", "D86D3056D0F58330AE3B307B005307A7"],
  ["skyT", "#06b6d4", "FFE0D0DEE40C81CC67C354095ADCBD4C"],
  ["bluT", "#3b82f6", "E2F159BDF8B2ECBAF0A30708086485DE"],
  ["purT", "#a855f7", "7502610F1180E197D03D93E4476CF7BD"],
];
export const b = [
  ["off4", "#333333", "DFBA78C50667A6ED7267221C44943F13"],
  ["pin4", "#ec4899", "31D5A246A1007E6EB15CF51A87BAF4BE"],
  ["pin2", "#f472b6", "50C2A96978EABDBCCC577327C2F2B8FB"],
  ["whi4", "#ffffff", "52876D74487BF30CDC864815FBF07AD5"],
  ["whiT", "#eeeeee", "97744677DDF17B4698CCCCEDE765D305"],
  ["rai4", "rainbow", "4217925EA4B20FA737BE38832E312634"],
];
