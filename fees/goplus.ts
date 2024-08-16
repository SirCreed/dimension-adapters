import { FetchOptions, SimpleAdapter } from "../adapters/types";
import { CHAIN } from "../helpers/chains";
import BigNumber from "bignumber.js";

const USDT_MINT = "0x55d398326f99059ff775485246999027b3197955";
const GOPLUS_FOUNDATION = "0x34ebddd30ccbd3f1e385b41bdadb30412323e34f";
const GOPLUS_REVENUE_POOL = "0x648d7f4ad39186949e37e9223a152435ab97706c";

const BALANCE_ABI = 'erc20:balanceOf';
const CALLS = [
      {
          target: USDT_MINT,
          params: [GOPLUS_FOUNDATION]
      },
      {
          target: USDT_MINT,
          params: [GOPLUS_REVENUE_POOL]
      },
  ];

const fetch = async (options: FetchOptions) => {
  const dailyFees = options.createBalances();
  const totalFees = options.createBalances();
  const [foundationBalanceStart, revenueBalanceStart] = await options.fromApi.multiCall({
    abi: BALANCE_ABI,
    calls: CALLS
  });
  const [foundationBalanceEnd, revenueBalanceEnd] = await options.toApi.multiCall({
    abi: BALANCE_ABI,
    calls: CALLS
  });
  const dailyFoundationReceived = BigNumber(foundationBalanceEnd).minus(BigNumber(foundationBalanceStart));
  const dailyRevenueReceived = BigNumber(revenueBalanceEnd).minus(BigNumber(revenueBalanceStart));
  const dailyTotal = dailyFoundationReceived.plus(dailyRevenueReceived).toFixed(0);
  dailyFees.add(USDT_MINT, dailyTotal);
  totalFees.add(USDT_MINT, BigNumber(foundationBalanceEnd).plus(BigNumber(revenueBalanceEnd)).toFixed(0));
  return { dailyFees, totalFees };
};

const adapter: SimpleAdapter = {
  version: 2,
  adapter: {
    [CHAIN.BSC]: {
      fetch: fetch,
      start: 36724659,
      meta: {
        methodology: {
            Fees: "All fees comes from users for security service provided by GoPlus Network."
        }
      }
    },
  },
};

export default adapter;
