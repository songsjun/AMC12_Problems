# 2010 AMC 12A Problem 23

> This problem is the same as [2010 AMC 12A #23](https://artofproblemsolving.com/wiki/index.php/2010_AMC_12A_Problems) and [2010 AMC 10A #24](https://artofproblemsolving.com/wiki/index.php/2010_AMC_10A_Problems).
## Problem
The number obtained from the last two nonzero digits of 90! is equal to n. What is n?

$\textbf{(A)}\ 12 \qquad \textbf{(B)}\ 32 \qquad \textbf{(C)}\ 48 \qquad \textbf{(D)}\ 52 \qquad \textbf{(E)}\ 68$
## Hints and Method of Attack
Let P be the result of dividing 90! by tens such that P is not divisible by 10. We want to consider P $\mod 100.$ But because 100 is not prime, and because P is obviously divisible by 4 (if in doubt, look at the answer choices), we only need to consider P $\mod 25.$

However, 25 is a very particular number. 1 $\cdot 2 \cdot 3 \cdot 4 \equiv -1 \text{ }(\text{mod }25),$ and so is 6 $\cdot 7 \cdot 8 \cdot 9.$ How can we group terms to take advantage of this fact?

There might be a problem when you cancel out the $10s$ from 90!. One method is to cancel out a factor of 2 from an existing number along with a factor of 5. But this might prove cumbersome, as the grouping method will not be as effective. Instead, take advantage of *inverses* in modular arithmetic. Just leave the negative powers of 2 in a "storage base," and take care of the other terms first. Then, use Fermat's Little Theorem to solve for the power of 2.

Video Solution: https://youtu.be/30CamkkifHM?t=766
## Solution 1
We will use the fact that for any integer n,

$$
\begin{align*}(5n+1)(5n+2)(5n+3)(5n+4)&=[(5n+4)(5n+1)][(5n+2)(5n+3)]\\ &=(25n^2+25n+4)(25n^2+25n+6)\equiv 4\cdot 6\\ &=24\pmod{25}\equiv -1\pmod{25}.\end{align*}
$$


First, we find that the number of factors of 10 in 90! is equal to $\left\lfloor \frac{90}5\right\rfloor+\left\lfloor\frac{90}{25}\right\rfloor=18+3=21.$ Let N=$\frac{90!}{10^{21}}.$ The n we want is therefore the last two digits of N, or N$\pmod{100}.$ If instead we find N$\pmod{25},$ we know that N$\pmod{100},$ what we are looking for, could be N$\pmod{25}, N\pmod{25}+25, N\pmod{25}+50,$ or N$\pmod{25}+75.$ Only one of these numbers will be a multiple of four, and whichever one that is will be the answer, because N$\pmod{100}$ has to be a multiple of 4.

If we divide 90! by $5^{21}$ to create M by taking out all the factors of 5 in 90!, we can write N as $\frac M{2^{21}}$ where

$$M=1\cdot 2\cdot 3\cdot 4\cdot 1\cdot 6\cdot 7\cdot 8\cdot 9\cdot 2\cdots 89\cdot 18,$$

where every multiple of 5 is replaced by the number with all its factors of 5 removed. Specifically, every number in the form $5n$ is replaced by n, and every number in the form $25n$ is replaced by n.

The number M can be grouped as follows:


$$
\begin{align*}M= &(1\cdot 2\cdot 3\cdot 4)(6\cdot 7\cdot 8\cdot 9)\cdots(86\cdot 87\cdot 88\cdot 89)\\ &\cdot (1\cdot 2\cdot 3\cdot 4)(6\cdot 7\cdot 8\cdot 9)\cdots (16\cdot 17\cdot 18) \\ &\cdot (1\cdot 2\cdot 3).\end{align*}
$$


Where the first line is composed of the numbers in 90! that aren't multiples of five, the second line is the multiples of five **and not 25** after they have been divided by five, and the third line is multiples of 25 after they have been divided by 25.

Using the identity at the beginning of the solution, we can reduce M to


$$
\begin{align*}M&\equiv(-1)^{18} \cdot (-1)^3(16\cdot 17\cdot 18) \cdot (1\cdot 2\cdot 3) \\ &= 1\cdot -21\cdot 6\\ &= -1\pmod{25} =24\pmod{25}.\end{align*}
$$


Using the fact that $2^{10}=1024\equiv -1\pmod{25} (o$r simply the fact that $2^{21}=2097152$ if you have your powers of 2 memorized), we can deduce that $2^{21}\equiv 2\pmod{25}.$ Therefore N=$\frac M{2^{21}}\equiv \frac$ {24}$2\pmod{25}=12\pmod{25}.$

Finally, combining with the fact that N$\equiv 0\pmod 4$ yields $n=\boxed{\textbf{(A)}\ 12}.$
## Solution 2
Let P be 90! after we truncate its zeros. Notice that 90! has exactly (floored) $\left\lfloor\frac{90}{5}\right\rfloor + \left\lfloor\frac{90}{25}\right\rfloor = 21$ factors of 5; thus, P = $2^{-21}\cdot 5^{-21}\cdot 90$!. We shall consider P modulo 4 and 25, to determine its residue modulo 100. It is easy to prove that P is divisible by 4 (consider the number of $2s$ dividing 90! minus the number of $5s$ dividing 90!), and so we only need to consider P modulo 25.

Now, notice that for integers a, n we have($5n$ + a)(5n - a) $\equiv -a^2 \mod 25.$

Thus, for integral a: ($10a + $1)(10a + 2)(10a + 3)(10a + 4)(10a + 6)(10a + 7)(10a + 8)(10a + 9) $\equiv (-1)(-4)(-9)(-16) \equiv 576 \equiv 1 \mod 25.$ Using this process, we can essentially remove all the numbers which had not formerly been a multiple of 5 in 90! from consideration.

Now, we consider the remnants of the 5, 10, 15, 20, ..., 90 not yet eliminated. After factoring out a 2 from each of the 9 even numbers in this sequence, the 10, 20, 30, ..., 90 becomes 1, 2, 3, 4, 1, 6, 7, 8, 9, whose product is 1 mod 25. We have accounted for 9 of the 21 2's thus we still need to multiply by $2^{-12}$. Also, the 5, 15, 25, ..., 85 becomes 1, 3, 1, 7, 9, 11, 13, 3, 17. Multiplying out 1, 3, 1, 7, ..., 17 yields 2 modulo 25, and so we are left to compute $2^{-11}$. Also note that $\phi(25)=5^2-5^1=20.$ Euler's Theorem states that $2^{\phi(25)}\equiv 1 \mod 25,$ thus $2^{-11}\equiv 2^{-11+20} = 2^9 = 512 \equiv 12 \mod 25.$ Because 12 is also a multiple of 4, we can utilize the Chinese Remainder Theorem to show that P $\equiv 12 \mod 100$ and so the answer is $\boxed{12}.$
## Solution 3
We start of by truncating the $0s$ off 90!, just like Solution 2. Since there are $v_5(90!)=\left\lfloor\frac{90}{5}\right\rfloor+\left\lfloor\frac{90}{25}\right\rfloor = 21$ terminating zeroes, we have the number we obtain from truncating the terminating zeroes at the end of 90! will be $\frac{90!}{10^{21}}.$

By [Chinese Remainder Theorem](https://artofproblemsolving.com/wiki/index.php/Chinese_Remainder_Theorem), we can divide the mod 100 into mod 4 and mod 25. We know that there are way more than 23 $2s$ in 90!, so we have

$\dfrac{90!}{10^{21}} \equiv 0 \text{ } \text{ (mod } 4 \text{)}$

Now, notice that $\frac{90!}{5^{21}}$ is basically 90! without any factors that are multiples of 5.

$1\cdot 2\cdot 3\cdot 4\cdot 6\cdot 7\cdots 23\cdot 24 \text{ } \text{ (mod } 25 \text{)}$

We can rewrite the expression as

($1\cdot 2\cdot 3\cdot 4\cdot 6\cdot 7\cdots 12)^2 \text{ } \text{ (mod } 25 \text{)}$

We also have

$1\cdot 2\cdot 3\cdot 4\cdot 6\cdot 7\cdots 12 \equiv 8\cdot 8\cdot 9\cdot 11\cdot 12 \equiv 7 \text{ } \text{ (mod } 25 \text{)}$

Squaring the expression gets us

($1\cdot 2\cdot 3\cdot 4\cdot 6\cdot 7\cdots 12)^2 \equiv 49 \equiv -1 \text{ } \text{ (mod } 25 \text{)}$

Notice that there are 3 of this string of numbers multiplied together occurs four times in $\frac{90!}{10^{21}},$ the fourth being only a partial

$1\cdot 2\cdot 3\cdot 4\cdots 14 \equiv 24 \equiv -1 \text{ } \text{ (mod } 25 \text{)}$

Note that as in Solution 1, the residue from extracting the fives is
$1\cdot 2\cdot 3\cdot 4\cdots 18 \cdot 1 \cdot 2 \cdot 3 \equiv -1 \text{ } \text{ (mod } 25 \text{)}$

Multiplying these together gives us

$\frac{90!}{10^{21}} \equiv \frac{\frac{90!}{5^{21}}}{2^{21}} \equiv \frac{(-1)^5}{2^{21}} \equiv \frac{-1}{2^{21}} \text{ } \text{ (mod } 25 \text{)}$

By Euler's Theorem, we have $\frac{-1}{2^{21}} \equiv -13^{21} \equiv -13^{\phi{(25)}}\cdot 13 \equiv -13 \equiv 12 \text{ } \text{ (mod } 25 \text{)}$

Thus, we want to solve x $\equiv 12 \text{ } \text{ (mod } 25 \text{)}$ and x $\equiv 0 \text{ } \text{ (mod } 4 \text{)}.$ An obvious solution is $x\equiv 12$ and by Chinese Remainder Theorem, we have $x\equiv 12$ is the only solution. So thus, $\frac{90!}{10^{21}} \equiv \boxed{12} \text{ } \text{ (mod } 100 \text{)}$

*~sml1809*

*~minor edits by [https://artofproblemsolving.com/wiki/index.php/User:Kevinchen_yay KevinChen_Yay]*
## Remark (Chinese Remainder Theorem)
Both solution 1 and solution 2 rely on n $\equiv 12 (\bmod$ { $\quad 25}), n \equiv 0 (\bmod$ { $\quad 4$}) to get n ($\bmod$ { $\quad 100$})

By [https://artofproblemsolving.com/wiki/index.php/Chinese_Remainder_Theorem Chinese Remainder Theorem], the general solution of the system of 2 linear congruences is:

$$n \equiv r_1 (\bmod { \quad m_1}), n \equiv r_2 (\bmod { \quad m_2}), (m_1, m_2) = 1$$

 Find $k_1$ and $k_2$ such that $k_1m_1\equiv 1 (\bmod{ \quad m_2}),k_2m_2\equiv 1 (\bmod{ \quad m_1})$
 Then n $\equivk_2m_2r_1+k_1m_1r_2 (\bmod{ \quad m_1 m_2})$

In this problem, n $\equiv 12 (\bmod$ { $\quad 25}), n \equiv 0 (\bmod$ { $\quad 4$}):

$$
n \equiv 12 (\bmod{ \quad 25}), n \equiv 0 (\bmod{ \quad 4}), (25, 4) = 1
1 \cdot 25 \equiv 1 (\bmod{ \quad 4}), 19 \cdot 4 \equiv 1 (\bmod{ \quad 25})
$$

 Then n $\equiv 19 \cdot 4 \cdot 12 + 1 \cdot 25 \cdot 0 \equiv 12 (\bmod{ \quad 100})$

~[https://artofproblemsolving.com/wiki/index.php/User:Isabelchen isabelchen]
$$=$$
## See also
