# 2023 AMC 12A Problem 17

## Problem
Flora the frog starts at 0 on the number line and makes a sequence of jumps to the right. In any one jump, independent of previous jumps, Flora leaps a positive integer distance m with probability $\frac{1}{2^m}.$

What is the probability that Flora will eventually land at 10?

$\textbf{(A)}~\frac{5}{512}\qquad\textbf{(B)}~\frac{45}{1024}\qquad\textbf{(C)}~\frac{127}{1024}\qquad\textbf{(D)}~\frac{511}{1024}\qquad\textbf{(E)}~\frac{1}{2}$
## Solution 1
Initially, the probability of landing at 10 and landing past 10 (summing the infinte series) are exactly the same. Landing before 10 repeats this initial condition, with a different irrelevant scaling factor. Therefore, the probability must be $\boxed{\textbf{(E)}~\frac12}.$
## Solution 2
Let's denote f(n) as the probability of reaching n from 0. We immediately see that f(0) = 1, and f(1) = $\frac{1}{2},$ since there's only one way to get to 1 from 0. Just jump!

Now, let's write an expression for f(10). Suppose we know f(9),f(8),\dotsc,f(2).

The probability of reaching 10 from some integer k < 10 will be $\frac{1}{2^{10-k}} (u$se the formula given in the problem!)
The probability of reaching that integer k from 0 is going to be f(k). Then, the probability of going from 0 $\to$\underbrace{ k $\to $10}_{$\text{one jump}$} will be $\mathbb{P}(\text{Reaching } 10 \text{ from } 0 \text$ { while passing through } k) = f(k) $\cdot \frac{1}{2^{10-k}}$
We want the probability of reaching 10 from anywhere though, so what we can do is sum over all passing points k, i.e.
f(10) = $\sum_{k=0}^9 \mathbb{P}(\text{Reaching } 10 \text{ from } 0 \text$ { while passing through } k) = $\sum_{k=0}^9 \frac{1}{2^{10-k}} \cdot$ f(k)

Now that we have expressed our problem formally, we can actually start solving it!

Let's calculate f(9) (our expression is actually a general fact, not just limited to 10).

$$
f(9) = \sum_{k=0}^8 \frac{1}{2^{9-k}} \cdot f(k)
\frac{f(9)}{2} = \sum_{k=0}^8 \frac{1}{2^{10-k}} \cdot f(k)
$$

Hmm, we see that the first 8 terms of $\frac{f(9)}{2}$ are exactly the first 8 terms of f(10). Let's substitute it in.
f(10) = $\frac{1}{2} \cdot$ f(9) + $\color{red} \sum_{k=0}^8 \frac{1}{2^{10-k}} \cdot$ f(k)
f(10) = $\frac{1}{2} \cdot$ f(9) + $\color{red} \frac{1}{2} \cdot$ f(9)
$$f(10) = f(9)$$
Isn't that interesting. Turns out, this reasoning can be extended all the way to f(10) = f(9) = \dotsc = f(2) = f(1).

It breaks at f(1) $\neq$ f(0), since f(1) = $\frac{1}{2}$ f(0). Anyway, with this, we see that the answer is just

$$f(10) = f(1) = \boxed{\textbf{(E)} \ \frac{1}{2}}$$
~ $\color{magenta}$ zoomanTV
## Solution 3
In order to find the probability of landing on 10, we must multiply the amount of successful combinations by the probability of those combinations. Notice for any successful combination of steps, the probability must always be $\frac{1}{2^{10}}.$ Now, we only need to find the amount of possibilities for steps since we know the probability of each combination occurring is the same. This can be done using sticks and stones $C_{0}^{9}+C_{1}^{9}+C_{2}^{9}+...+C_{9}^{9} = 2^9$. Hence the final answer is $\frac{2^{9}}{2^{10}}$ or $\boxed{\textbf{(E)} \frac{1}{2}}$

*~ShangJ2*

Note that an alternative way of thinking the number of possible steps is that for each number from 1 to 9, there are 2 possibilities: Flora lands on this number or Flora doesn't land on this number. Thus there are $2^9$ total possible combination of steps

*~dwarf_marshmallow*
## Solution 3.1
Like said above, the probability of each successful combination is always $\frac{1}{2^{10}}. A$ simple way of thinking about counting each combination is visualizing a series. Let's make a series with 10 terms, where 1 means that Flora touches the lilypad and 0 means that she does not: $a_1, a_2, a_3, a_4, a_5, a_6, a_7, a_8, a_9, a_{10}$. In this set, $a_i$ is either 0 or 1. Note that the last lilypad, $a_{10}$ must always be 1 for a successful combination. Now we just need to find the number of different ways to make $a_1$ through $a_9$ 0 or 1. This is obviously $2^{9} = $512. $\frac{512}{1024} = \boxed{\textbf{(E)} \frac{1}{2}}$

*~Bread10*
## Solution 4 (engineer's induction)
The probability frog lands on 1 is trivially $\frac{1}{2}.$

The probability frog lands on 2 is $\frac{1}{4} + \frac{1}{2}\cdot \frac{1}{2} = \frac{1}{2},$ from the two cases 0-2 and 0-1-2.

The probability frog lands on 3 is $\frac{1}{8} + 2\cdot \frac{1}{2} \cdot \frac{1}{4} + \frac{1}{2}\cdot \frac{1}{2}\cdot \frac{1}{2} = \frac{1}{2}$ from the cases 0-3, 0-1-3 and 0-2-3, 0-1-2-3.

The probability frog lands on 4 is $\frac{1}{16} + 2\cdot \frac{1}{2} \cdot \frac{1}{8} + \frac{1}{4}\cdot \frac{1}{4} + 3\cdot \frac{1}{2}\cdot \frac{1}{2}\cdot \frac{1}{4} + \frac{1}{2} \cdot \frac{1}{2} \cdot \frac{1}{2} \cdot \frac{1}{2} = \frac{1}{2}$ from the cases 0-4, 0-1-4 and 0-3-4, 0-2-4, 0-1-2-4 and 0-1-3-4 and 0-2-3-4, 0-1-2-3-4.

It looks like the probability is $\frac{1}{2}$ regardless of the ending number. Therefore, we choose $\boxed{\textbf{(E)} \frac{1}{2}}$

*~sirswagger21*
## Solution 5
No matter what the probability of getting to the end has a probability of $\frac{1}{1024}$

So the thing is how many ways to jump from the first spot to the last spot.

Given it requires n steps to reach the end, there are $\binom{10-1}{n-1}=\binom{9}{n-1}$ ways to get the end.

$$\sum_{n=1}^{10}\binom{9}{n-1}=2^9=512\implies \frac{1}{2}$$

*~bluesoul*
## Solution 7 (Mathematician's Induction)
A more rigorous proof to solution 4.

Let $P_n$ represents the probability of Flora landing on number n

We hypothesize that $P_n=\frac{1}{2}, \forall$ n $\ge 1$

Base case: $P_1=\frac{1}{2}$ as shown in solution 4

Induction steps:


$$P_n = \frac{P_{n-1}}{2} + \frac{P_{n-2}}{4} + \dots + \frac{P_{n-m}}{2^m} \dots + \frac{P_0}{2^n}$$

We assume that $P_{n-1}=P_{n-2}=\dots = P_1 = \frac{1}{2}$ and $P_0 = 1$ is true

$$P_n = \frac{1}{4} + \frac{1}{8} + \dots + \frac{1}{2^{n-1}} + \frac{1}{2^n} + \frac{1}{2^n}$$

(it's obvious here that this will add up to $\frac{1}{2}$ but to be 100% rigorous we do sum of geometric sequences )

$$
P_n = \frac{\frac{1}{4}(1 - (\frac{1}{2})^{n-1})}{1 - \frac{1}{2}} + \frac{1}{2^n}
P_n = \frac{2^{n-1} - 1}{2^n} + \frac{1}{2^n}
P_n = \frac{2^{n-1}}{2^n} = \frac{1}{2}
$$

Thus, since our base case is true, by induction every $P_n=\frac{1}{2}$ for n $\ge 1$ and $P_{10}=\boxed{\textbf{(E)} \frac{1}{2}}$

*~dwarf_marshmallow*
## Solution 8 (Genfuncs OP)
Let f(z)=$\sum$\$limits_{k=1}^{$\infty$}\left(\frac{z}{2}\right)^{k}=\frac{\frac{z}{2}}{1-\frac{z}{2}}=\frac{z}{2-z}.$ The coefficient of $z^{n}$ in f(z) is the probability of reaching n in exactly one step. Now, write g(z)=$\sum$\$limits_{k=1}^{$\infty$}$f($z)^{k}=\frac{f(z)}{1-f(z)}.$ Then, the coefficient of $z^{n}$ in g(z) is the probability of reaching n at some point, since we either do it in one step, two steps, etc. Now, we simplify g(z)=$\frac{\frac{z}{2-z}}{1-\frac{z}{2-z}}=\frac{z}{2-2z}=\frac{1}{2} \cdot \frac{z}{1-z}=\sum$\$limits_{n=1}^{$\infty$}\frac{1}{2}z^{n}$. Therefore, the probability of eventually reaching n is $\frac{1}{2}$ for all $n\geq1,$ so our answer is $\boxed{\textbf{(E)}\frac{1}{2}}.$

*~qqqwerw*
*~NOOK(Minor LaTeX edit)*
## Solution 9 (Stars and Bars)
We can start off by doing casework for the amount of jumps we take to reach 10:


$$
\begin{align}
\text{C_1: One jump} &\Longrightarrow \frac{1}{2^{10}} = \frac{1}{1024}
\end{align}
$$


and then after doing a few, we realize that the probabilty is just equal to:


$$
\begin{align}
\dfrac{\text{Number of ways to split 10 into positive integers}}{2^{10}}
\end{align}
$$


Now, we can just use stars and bars for each case which we find to be $\binom{9}{0} + \binom{9}{1} +$ ... $\binom{9}{8} + \binom{9}{9} = 2^9,$ so our answer is just $\dfrac{2^9}{2^{10}} = \boxed{\textbf{(E)}\frac{1}{2}}$
*~jb2015007*
## Video Solution
https://youtu.be/dUyNe_2bBmM
_~Education, the Study of Everything_
## Video Solution 1 by OmegaLearn
https://youtu.be/n8vGP49-x1Q
## Video Solution
https://youtu.be/4cGmuTGFWyk

*~Steven Chen (Professor Chen Education Palace, www.professorchenedu.com)*
## Video Solution by Solve It
https://youtu.be/rsxyg6mcFZg
## Video Solution by TheBeautyofMath
https://youtu.be/k6GuIyBPohw

*~IceMatrix*
## See also
