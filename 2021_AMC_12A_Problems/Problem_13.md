# 2021 AMC 12A Problem 13

## Problem
Of the following complex numbers z, which one has the property that $z^5$ has the greatest real part?

$\textbf{(A) }{-}2 \qquad \textbf{(B) }{-}\sqrt3+i \qquad \textbf{(C) }{-}\sqrt2+\sqrt2 i \qquad \textbf{(D) }{-}1+\sqrt3 i\qquad \textbf{(E) }2i$
## Solution 1 (De Moivre's Theorem: Degrees)
First, $\textbf{(B)}$ is $2\text{cis}(150), \textbf{(C)}$ is $2\text{cis}(135), \textbf{(D)}$ is $2\text{cis}(120).$

Taking the real part of the 5th power of each we have:

$\textbf{(A): }(-2)^5=-32$

$\textbf{(B): }32\cos(750)=32\cos(30)=16\sqrt{3}$

$\textbf{(C): }32\cos(675)=32\cos(-45)=16\sqrt{2}$

$\textbf{(D): }32\cos(600)=32\cos(240)<0$

$\textbf{(E): }(2i)^5=32i, whose real part is 0$

Thus, the answer is $\boxed{\textbf{(B) }{-}\sqrt3+i}.$

*~JHawk0224*
## Solution 2 (De Moivre's Theorem: Radians)
We rewrite each answer choice to the polar form z=r\operatorname{cis}$\theta=r(\cos\theta+i\sin\theta),$ where r is the magnitude of z such that $r\geq0,$ and $\theta$ is the argument of z such that $0\leq\theta<2\pi.$

By **De Moivre's Theorem**, the real part of $z^5$ is \operatorname{Re}$\left(z^5\right)=r^5\cos{(5\theta)}.$ We construct a table as follows:

$$
\begin{array}{c|ccc|ccc|cclclclcc} & & & & & & & & & & & & & & & \\ [-2ex] \textbf{Choice} & & \boldsymbol{r} & & & \boldsymbol{\theta} & & & & & & \multicolumn{1}{c}{\boldsymbol{\operatorname{Re}\left(z^5\right)}} & & & & \\ [0.5ex] \hline & & & & & & & & & & & & & & & \\ [-1ex] \textbf{(A)} & & 2 & & & \pi & & & &32\cos{(5\pi)}&=&32\cos\pi&=&32(-1)& & \\ [2ex] \textbf{(B)} & & 2 & & & \tfrac{5\pi}{6} & & & &32\cos{\tfrac{25\pi}{6}}&=&32\cos{\tfrac{\pi}{6}}&=&32\left(\tfrac{\sqrt3}{2}\right)& & \\ [2ex] \textbf{(C)} & & 2 & & & \tfrac{3\pi}{4} & & & &32\cos{\tfrac{15\pi}{4}}&=&32\cos{\tfrac{7\pi}{4}}&=&32\left(\tfrac{\sqrt2}{2}\right)& & \\ [2ex] \textbf{(D)} & & 2 & & & \tfrac{2\pi}{3} & & & &32\cos{\tfrac{10\pi}{3}}&=&32\cos{\tfrac{4\pi}{3}}&=&32\left(-\tfrac{1}{2}\right)& & \\ [2ex] \textbf{(E)} & & 2 & & & \tfrac{\pi}{2} & & & &32\cos{\tfrac{5\pi}{2}}&=&32\cos{\tfrac{\pi}{2}}&=&32\left(0\right)& & \\ [1ex] \end{array}
$$

Clearly, the answer is $\boxed{\textbf{(B) }{-}\sqrt3+i}.$

*~MRENTHUSIASM*
## Solution 3 (Binomial Theorem)
We evaluate the fifth power of each answer choice:

- For $\textbf{(A)},$ we have $(-2)^5=-32,$ from which \operatorname{Re}$\left((-2)^5\right)=-32.$

- For $\textbf{(E)},$ we have $(2i)^5=32i$, from which \operatorname{Re}$\left((2i)^5\right)=0.$

We will apply the Binomial Theorem to each of $\textbf{(B)},\textbf{(C)},$ and $\textbf{(D)}.$

More generally, let z=a+bi for some real numbers a and b.

Two solutions follow from here:
### Solution 3.1 (Real Parts Only)
To find the real part of $z^5,$ we only need the terms with even powers of i:

$$
\begin{align*} \operatorname{Re}\left(z^5\right)&=\operatorname{Re}\left((a+bi)^5\right) \\ &=\sum_{k=0}^{2}\binom{5}{2k}a^{5-2k}(bi)^{2k} \\ &=\binom50 a^{5}(bi)^{0} + \binom52 a^{3}(bi)^{2} + \binom54 a^{1}(bi)^{4} \\ &=a^5 - 10a^3b^2 + 5ab^4. \end{align*}
$$

We find the real parts of $\textbf{(B)},\textbf{(C)},$ and $\textbf{(D)}$ directly:

- For $\textbf{(B)},$ we have \operatorname{Re}$\left(\left(-\sqrt3+i\right)^5\right)=16\sqrt3.$

- For $\textbf{(C)},$ we have \operatorname{Re}$\left(\left(-\sqrt2+\sqrt2i\right)^5\right)=16\sqrt2.$

- For $\textbf{(D)},$ we have \operatorname{Re}$\left(\left(-1+\sqrt3i\right)^5\right)=-16.$

Therefore, the answer is $\boxed{\textbf{(B) }{-}\sqrt3+i}.$

*~MRENTHUSIASM*
### Solution 3.2 (Full Expansions)
The full expansion of $z^5$ is

$$
\begin{align*} z^5&=(a+bi)^5 \\ &=\sum_{k=0}^{5}\binom5k a^{5-k}(bi)^k \\ &=\binom50 a^{5}(bi)^0+\binom51 a^{4}(bi)^1+\binom52 a^{3}(bi)^2+\binom53 a^{2}(bi)^3+\binom54 a^{1}(bi)^4+\binom55 a^{0}(bi)^5 \\ &=a^5+5a^4bi-10a^3b^2-10a^2b^3i+5ab^4+b^5i \\ &=\left(a^5-10a^3b^2+5ab^4\right) + \left(5a^4b-10a^2b^3+b^5\right)i. \end{align*}
$$

We find the full expansions of $\textbf{(B)},\textbf{(C)},$ and $\textbf{(D)},$ then extract their real parts:

- For $\textbf{(B)},$ we have $\left(-\sqrt3+i\right)^5=16\sqrt3+16$i, from which \operatorname{Re}$\left(\left(-\sqrt3+i\right)^5\right)=16\sqrt3.$

- For $\textbf{(C)},$ we have $\left(-\sqrt2+\sqrt2i\right)^5=16\sqrt2-16\sqrt2$i, from which \operatorname{Re}$\left(\left(-\sqrt2+\sqrt2i\right)^5\right)=16\sqrt2.$

- For $\textbf{(D)},$ we have $\left(-1+\sqrt3i\right)^5=-16-16\sqrt3$i, from which \operatorname{Re}$\left(\left(-1+\sqrt3i\right)^5\right)=-16.$

Therefore, the answer is $\boxed{\textbf{(B) }{-}\sqrt3+i}.$

*~MRENTHUSIASM*
## Video Solution by Punxsutawney Phil
https://youtube.com/watch?v=FD9BE7hpRvg
## Video Solution by Hawk Math
https://www.youtube.com/watch?v=AjQARBvdZ20
## Video Solution by OmegaLearn (Using Polar Form and De Moivre's Theorem)
https://youtu.be/2qXVQ5vBKWQ

*~pi_is_3.14*
## Video Solution by TheBeautyofMath
https://youtu.be/ySWSHyY9TwI?t=568

*~IceMatrix*
## See Also
