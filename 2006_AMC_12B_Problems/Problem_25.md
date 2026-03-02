# 2006 AMC 12B Problem 25

## Problem
A sequence $a_1,a_2,\dots$ of non-negative integers is defined by the rule $a_{n+2}$=|$a_{n+1}-a_n$| for $n\geq 1.$ If $a_1=999, a_2<999$ and $a_{2006}=1$, how many different values of $a_2$ are possible?


$$\mathrm{(A)}\ 165 \qquad \mathrm{(B)}\ 324 \qquad \mathrm{(C)}\ 495 \qquad \mathrm{(D)}\ 499 \qquad \mathrm{(E)}\ 660$$

## Solution 1
We say the sequence $(a_n)$ completes at i if i is the minimal positive integer such that $a_i=a_{i + 1} = 1$. Otherwise, we say $(a_n)$ does not complete.

Note that if $d =\gcd(999, a_2) \neq 1,$ then d|$a_n$ for all n $\geq 1,$ and d does not divide 1, so if $\gcd(999, a_2) \neq 1,$ then $(a_n)$ does not complete. (Also, $a_{2006}$ cannot be 1 in this case since d does not divide 1, so we do not care about these $a_2$ at all.)

From now on, suppose $\gcd(999, a_2) = 1.$

We will now show that $(a_n)$ completes at i for some i $\leq 2006.$ We will do this with 3 lemmas.

**Lemma:** If $a_j\neqa_{j + 1}$, and neither value is 0, then $\max(a_j, a_{j + 1}) > \max(a_{j + 2}, a_{j + 3}).$

**Proof:** There are 2 cases to consider.

If $a_j>a_{j + 1}$, then $a_{j + 2}=a_j-a_{j + 1}$, and $a_{j + 3}$ = |$a_j-2a_{j + 1}$|. So $a_j>a_{j + 2}$ and $a_j>a_{j + 3}$.

If $a_j<a_{j + 1}$, then $a_{j + 2}=a_{j + 1}-a_j$, and $a_{j + 3}=a_j$. So $a_{j + 1}>a_{j + 2}$ and $a_{j + 1}>a_{j + 3}$.

In both cases, $\max(a_j, a_{j + 1}) > \max(a_{j + 2}, a_{j + 3}),$ as desired.
----------------------

**Lemma:** If $a_i=a_{i + 1}$, then $a_i = 1$. Moreover, if instead we have $a_i = 0$ for some i > 2, then $a_{i - 1}=a_{i - 2} = 1$.

**Proof:** By the way $(a_n)$ is constructed in the problem statement, having two equal consecutive terms $a_i=a_{i + 1}$ implies that $a_i$ divides every term in the sequence. So $a_i$ | 999 and $a_i$ | $a_2$, so $a_i$ | $\gcd(999, a_2) = 1,$ so $a_i = 1$. For the proof of the second result, note that if $a_i = 0$, then $a_{i - 1}=a_{i - 2}$, so by the first result we just proved, $a_{i - 2}=a_{i - 1} = 1$.
----------------------

**Lemma:** $(a_n)$ completes at i for some i $\leq 2000.$

**Proof:** Suppose $(a_n)$ completed at some i > 2000 or not at all. Then by the second lemma and the fact that neither 999 nor $a_2$ are 0, none of the pairs ($a_1, a_2), ..., (a_{1999}$, $a_{2000}$) can have a 0 or be equal to (1, 1). So the first lemma implies
$$\max(a_1, a_2) > \max(a_3, a_4) > \cdots > \max(a_{1999}, a_{2000}) > 0,$$
so $999 =\max(a_1, a_2) \geq 1000,$ a contradiction. Hence $(a_n)$ completes at i for some i $\leq 2000.$
----------------------

Now we're ready to find exactly which values of $a_2$ we want to count.

Let's keep in mind that 2006 $\equiv 2 \pmod 3$ and that $a_1 = 999$ is odd. We have two cases to consider.

**Case 1:** If $a_2$ is odd, then $a_3$ is even, so $a_4$ is odd, so $a_5$ is odd, so $a_6$ is even, and this pattern must repeat every three terms because of the recursive definition of $(a_n)$, so the terms of $(a_n)$ reduced modulo 2 are
1, 1, 0, 1, 1, 0, ...,
so $a_{2006}$ is odd and hence 1 (since if $(a_n)$ completes at i, then $a_k$ must be 0 or 1 for all k $\geq$ i).
---------------------

**Case 2:** If $a_2$ is even, then $a_3$ is odd, so $a_4$ is odd, so $a_5$ is even, so $a_6$ is odd, and this pattern must repeat every three terms, so the terms of $(a_n)$ reduced modulo 2 are
1, 0, 1, 1, 0, 1, ...,
so $a_{2006}$ is even, and hence 0.
---------------------

We have found that $a_{2006} = 1$ is true precisely when $\gcd(999, a_2) = 1$ and $a_2$ is odd. This tells us what we need to count.

There are $\phi(999) = 648$ numbers less than 999 and relatively prime to it ($\phi$ is the Euler totient function). We want to count how many of these are odd. Note that
$$t \mapsto 999 - t$$
is a 1-1 correspondence between the odd and even numbers less than and relatively prime to 999. So our final answer is $648/2 = 324$, or $\boxed{\text{B}}.$
## Solution 2 (estimation)
As in Solution 1, we show that $a_2$ must be odd. We notice that, after experimentation, all numbers eventually end up in a sequence 1,1,0,1,1,0,$\ldots,$ which points to the assumption that every 2 out of 3 values for $a_2$ work due to residue classes. Combining this with an estimated 50-50 chance that these values are either odd or even, since 999 values are nonnegative integers less than 999, we can estimate that there are about $999\cdot\frac{2}{3}\cdot\frac{1}{2}=333$ different values of $a_2$ that work. The closest answer choice by far is $\boxed{\textbf{(B) }324}.$

*~eevee9406*
## Solution 3 (PIE)
Notice that if $a_2$ is not relatively prime to $999 =3^3\cdot 37,$ then all elements in the sequence will be a multiple of 3 or 37, i.e. it cannot be 1. In addition, if $a_2$ is even, then $a_{2006}$ must also be even, so $a_{2006}\neq 1.$ For all other possible $a_2$ (those relatively prime to 2, 3, and 37), the sequence will become ...,1,1,0,1,1,0,... where $a_{2006}=1$. From PIE, the complement is

$$\left(\left\lfloor\frac{999}{2}\right\rfloor+1\right)+\left(\left\lfloor\frac{999}{3}\right\rfloor+1\right)+\left(\left\lfloor\frac{999}{37}\right\rfloor+1\right)-\left(\left\lfloor\frac{999}{2\cdot3}\right\rfloor+1\right)-\left(\left\lfloor\frac{999}{2\cdot 37}\right\rfloor+1\right)-\left(\left\lfloor\frac{999}{3\cdot37}\right\rfloor+1\right)+\left(\left\lfloor\frac{999}{2\cdot3\cdot37}\right\rfloor+1\right)=676$$

Note the +1 in each term because we have to include 0.
So the answer is $1000-676=\boxed{\textbf{(B) }324}.$

*~gimmeaworkingusername*
## See also
