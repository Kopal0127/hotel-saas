import { RateLimiterMemory } from "rate-limiter-flexible";

// 3 baar try, phir 5 minute band
export const loginRateLimiter = new RateLimiterMemory({
  points: 2,          // 0,1,2 = 3 tries (0 se count hota hai)
  duration: 300,      // 5 minute window
  blockDuration: 300, // 5 minute ke liye band
});

export async function checkRateLimit(ip: string) {
  try {
    await loginRateLimiter.consume(ip);
    return { success: true };
  } catch (error: any) {
    const msLeft = error.msBeforeNextReset || 300000;
    const minutesLeft = Math.ceil(msLeft / 1000 / 60);
    return {
      success: false,
      message: `Bahut zyada attempts! ${minutesLeft} minute baad try karo.`,
    };
  }
}