# 2021 AMC 12A Problem 18

> This problem is the same as [2021 AMC 10A #18](https://artofproblemsolving.com/wiki/index.php/2021_AMC_10A_Problems/Problem_18) and [2021 AMC 12A #18](https://artofproblemsolving.com/wiki/index.php/2021_AMC_12A_Problems/Problem_18).
## Problem
Let f be a function defined on the set of positive rational numbers with the property that f($a\cdot$ b)=f(a)+f(b) for all positive rational numbers a and b. Suppose that f also has the property that $f(p)=p$ for every prime number p. For which of the following numbers x is f(x)<0?

$\textbf{(A) }\frac{17}{32} \qquad \textbf{(B) }\frac{11}{16} \qquad \textbf{(C) }\frac79 \qquad \textbf{(D) }\frac76\qquad \textbf{(E) }\frac{25}{11}$
## Solution 1 (Intuitive)
From the answer choices, note that

$$
\begin{align*} f(25)&=f\left(\frac{25}{11}\cdot11\right) \\ &=f\left(\frac{25}{11}\right)+f(11) \\ &=f\left(\frac{25}{11}\right)+11. \end{align*}
$$

On the other hand, we have

$$
\begin{align*} f(25)&=f(5\cdot5) \\ &=f(5)+f(5) \\ &=5+5 \\ &=10. \end{align*}
$$

Equating the expressions for f(25) produces $f\left(\frac{25}{11}\right)+11=10,$ from which $f\left(\frac{25}{11}\right)=-1.$ Therefore, the answer is $\boxed{\textbf{(E) }\frac{25}{11}}.$

**Remark**

Similarly, we can find the outputs of f at the inputs of the other answer choices:

$$
\begin{alignat*}{10} &\textbf{(A)} \qquad && f\left(\frac{17}{32}\right) \quad && = \quad && 7 \\ &\textbf{(B)} \qquad && f\left(\frac{11}{16}\right) \quad && = \quad && 3 \\ &\textbf{(C)} \qquad && f\left(\frac{7}{9}\right) \quad && = \quad && 1 \\ &\textbf{(D)} \qquad && f\left(\frac{7}{6}\right) \quad && = \quad && 2 \end{alignat*}
$$

Alternatively, refer to Solutions 2 and 4 for the full processes.

*~Lemonie ~awesomediabrine ~MRENTHUSIASM*
## Solution 2 (Specific)
We know that $f(p) = f(p\cdot 1) =$ f(p) + f(1). By transitive, we have $f(p) = f(p)$ + f(1).
Subtracting f(p) from both sides gives 0 = f(1).
Also

$$
f(2)+f\left(\frac{1}{2}\right)=f(1)=0 \implies 2+f\left(\frac{1}{2}\right)=0 \implies f\left(\frac{1}{2}\right) = -2
f(3)+f\left(\frac{1}{3}\right)=f(1)=0 \implies 3+f\left(\frac{1}{3}\right)=0 \implies f\left(\frac{1}{3}\right) = -3
f(11)+f\left(\frac{1}{11}\right)=f(1)=0 \implies 11+f\left(\frac{1}{11}\right)=0 \implies f\left(\frac{1}{11}\right) = -11
$$

In $\textbf{(A)}$ we have $f\left(\frac{17}{32}\right)=17+5f\left(\frac{1}{2}\right)=17-5(2)=7.$

In $\textbf{(B)}$ we have $f\left(\frac{11}{16}\right)=11+4f\left(\frac{1}{2}\right)=11-4(2)=3.$

In $\textbf{(C)}$ we have $f\left(\frac{7}{9}\right)=7+2f\left(\frac{1}{3}\right)=7-2(3)=1.$

In $\textbf{(D)}$ we have $f\left(\frac{7}{6}\right)=7+f\left(\frac{1}{2}\right)+f\left(\frac{1}{3}\right)=7-2-3=2.$

In $\textbf{(E)}$ we have $f\left(\frac{25}{11}\right)=10+f\left(\frac{1}{11}\right)=10-11=-1.$

Thus, our answer is $\boxed{\textbf{(E) }\frac{25}{11}}.$

*~JHawk0224 ~awesomediabrine*
## Solution 3 (Generalized)
Consider the rational $\frac{a}{b},$ for a,b integers. We have $f(a)=f\left(\frac{a}{b}\cdotb\right)=f\left(\frac{a}{b}\right)+f(b).$ So $f\left(\frac{a}{b}\right)=f(a)-f(b).$ Let p be a prime. Notice that $f(p^k)=kf(p).$ And $f(p)=p.$ So if a=p_$1^{a_1}$p_$2^{a_2}\cdots$ p_$k^{a_k}$, f(a)=$a_1p_1+a_2p_2+\cdots+a_k$p_k. We simply need this to be greater than what we have for f(b). Notice that for answer choices $\textbf{(A)},\textbf{(B)},\textbf{(C)},$ and $\textbf{(D)},$ the numerator has fewer prime factors than the denominator, and so they are less likely to work. We check $\textbf{(E)}$ first, and it works, therefore the answer is $\boxed{\textbf{(E) }\frac{25}{11}}.$

*~yofro*
## Solution 4 (Generalized)
We derive the following properties of f:

 1.   By induction, we have $f\left(\prod_{k=1}^{n}$a_k$\right)=\sum_{k=1}^{n}$f(a_k)$$ for all positive rational numbers $a_k$ and positive integers n.
Since positive powers are just repeated multiplication of the base, it follows that $f\left(a^n\right)=f\left(\prod_{k=1}^{n}a\right)=\sum_{k=1}^{n}$f(a)=nf(a) for all positive rational numbers a and positive integers n.

2.   For all positive rational numbers a, we have $f(a)=f(a\cdot1)=f(a)+f(1),$ from which f(1)=0.

3.   For all positive rational numbers a, we have f(a)+f$\left(\frac1a\right)=f\left(a\cdot\frac1a\right)=f(1)=0,$ from which $f\left({\frac 1a}\right)=-f(a).$

For all positive integers x and y, suppose $\prod_{k=1}^{m}$p_$k^{d_k}$ and $\prod_{k=1}^{n}$q_$k^{e_k}$ are their respective prime factorizations. We get

$$
\begin{align*} f\left(\frac xy\right)&=f(x)+f\left(\frac 1y\right) \\ &=f(x)-f(y) && \hspace{10mm}\text{by Property 3} \\ &=f\left(\prod_{k=1}^{m}p_k^{d_k}\right)-f\left(\prod_{k=1}^{n}q_k^{e_k}\right) \\ &=\left[\sum_{k=1}^{m}f\left(p_k^{d_k}\right)\right]-\left[\sum_{k=1}^{n}f\left(q_k^{e_k}\right)\right] && \hspace{10mm}\text{by Property 1} \\ &=\left[\sum_{k=1}^{m}d_k f\left(p_k\right)\right]-\left[\sum_{k=1}^{n}e_k f\left(q_k\right)\right] && \hspace{10mm}\text{by Property 1} \\ &=\left[\sum_{k=1}^{m}d_k p_k \right]-\left[\sum_{k=1}^{n}e_k q_k \right]. \end{align*}
$$

We apply f to each fraction in the answer choices:

$$
\begin{alignat*}{10} &\textbf{(A)} \qquad && f\left(\frac{17}{32}\right) \quad && = \quad && f\left(\frac{17^1}{2^5}\right) \quad && = \quad && [1(17)]-[5(2)] \quad && = \quad && 7 \\ &\textbf{(B)} \qquad && f\left(\frac{11}{16}\right) \quad && = \quad && f\left(\frac{11^1}{2^4}\right) \quad && = \quad && [1(11)]-[4(2)] \quad && = \quad && 3 \\ &\textbf{(C)} \qquad && f\left(\frac{7}{9}\right) \quad && = \quad && f\left(\frac{7^1}{3^2}\right) \quad && = \quad && [1(7)]-[2(3)] \quad && = \quad && 1 \\ &\textbf{(D)} \qquad && f\left(\frac{7}{6}\right) \quad && = \quad && f\left(\frac{7^1}{2^1\cdot3^1}\right) \quad && = \quad && [1(7)]-[1(2)+1(3)] \quad && = \quad && 2 \\ &\textbf{(E)} \qquad && f\left(\frac{25}{11}\right) \quad && = \quad && f\left(\frac{5^2}{11^1}\right) \quad && = \quad && [2(5)]-[1(11)] \quad && = \quad && {-}1 \end{alignat*}
$$

Therefore, the answer is $\boxed{\textbf{(E) }\frac{25}{11}}.$

*~MRENTHUSIASM*
## Solution 5 (Quick, Dirty, and Frantic Last Hope)
Note that answer choices $\textbf{(A)}$ through $\textbf{(D)}$ are $\frac{\text{prime}}{\text{composite}},$ whereas $\textbf{(E)}$ is $\frac{\text{composite}}{\text{prime}}.$ Because the functional equation is related to primes, we hope that the uniqueness of answer choice $\boxed{\textbf{(E) }\frac{25}{11}}$ is enough.

*~OliverA*
## Solution 6 (Rushed Generalization)
If f(a $\cdot$ b) = f(a) + f(b), and if $f(p) = p$, then f(p $\cdot$ p) = $2p$. You can do this multiple times (Ex: $f(p^3) =3p$). You can quickly assume then, that f(p^n) = np. Thus the answer choices can then be rewritten as the product of a prime and another prime to the negative power. Answer choices A-C are straightforward. For D, you can rewrite $\frac{1}{6}$ as $\frac{1}{2} \cdot \frac{1}{3}.$ When you get to E, you get f(25) + f($\frac{1}{11}),$ which is 10 - 11, which is -1. So the answer is $\boxed{\textbf{(E) }\frac{25}{11}}$

*~Zeeshan12*
## Solution 7 (Generalized)
Note that for each of the answer choices we can multiply the fractions by their denominators to be left with only the numerator and also have the prime factorization of the denominators, then set the function equal to the numerator. This will be shown throughout the solution.

For answer choice $\text{(A) }\dfrac{17}{32},$ we have $f\left(\dfrac{17}{32}\right).$ Now, we can set up an equation by multiplying $\dfrac{17}{32}$ by 32 and setting it equal to 17. This will give $f\left(32\cdot\dfrac{17}{32}\right)=f(17)\rightarrow$ f(32)+f$\left(\dfrac{17}{32}\right)=f(17).$ Our goal is to find $f\left(\dfrac{17}{32}\right),$ therefore we must find f(32) and f(17). Since $f(p)=p$ for any prime p, f(17)=17. Taking the prime factorization of 32 gives $2^5,$ so f(32)=f($2\cdot2\cdot2\cdot2\cdot2)=f(2)+f(2)+f(2)+f(2)+f(2)=5f(2)=5\cdot2=10.$ Therefore, $10+f\left(\dfrac{17}{32}\right)=17$ and $f\left(\dfrac{17}{32}\right)=7$


$$
\text{(B) }\dfrac{11}{16}: f\left(\dfrac{11}{16}\right)\rightarrow f\left(16\cdot\dfrac{11}{16}\right)=f(11)
\rightarrow f(16)+f\left(\dfrac{11}{16}\right)=11\rightarrow 4f(2)+f\left(\dfrac{11}{16}\right)=11
\rightarrow f\left(\dfrac{11}{16}\right)=3
$$


$$
\text{(C) }\dfrac{7}{9}: f\left(\dfrac{7}{9}\right)\rightarrow f\left(9\cdot\dfrac{7}{9}\right)=f(7)
\rightarrow f(9)+f\left(\dfrac{7}{9}\right)=7\rightarrow 2f(3)+f\left(\dfrac{7}{9}\right)=7
\rightarrow f\left(\dfrac{7}{9}\right)=1
$$


$$
\text{(D) }\dfrac{7}{6}: f\left(\dfrac{7}{6}\right)\rightarrow f\left(6\cdot\dfrac{7}{6}\right)=f(7)
\rightarrow f(6)+f\left(\dfrac{7}{6}\right)=7\rightarrow f(2)+f(3)+f\left(\dfrac{7}{6}\right)=7
\rightarrow f\left(\dfrac{7}{6}\right)=2
$$


$$
\text{(E) }\dfrac{25}{11}: f\left(\dfrac{25}{11}\right)\rightarrow f\left(11\cdot\dfrac{25}{11}\right)=f(25)
\rightarrow f(11)+f\left(\dfrac{25}{11}\right)=2f(5)\rightarrow 11+f\left(\dfrac{25}{11}\right)=10
\rightarrow f\left(\dfrac{25}{11}\right)=-1
$$


Therefore, the answer is $\boxed{\text{(E) }\dfrac{25}{11}}$

Note: The general strategy here was the setting up of equations to find f(x). By setting it equal to f(a) where a was an integer, we could take the prime factorization to find the value of f(a) and also set up an equation involving f($\text{denominator})$ because the denominator was also an integer, therefore we could take the prime factorization and find its value

*~Tacos_are_yummy_1*
## Video Solution by Hawk Math
https://www.youtube.com/watch?v=dvlTA8Ncp58
## Video Solution by North America Math Contest Go Go Go Through Induction
https://www.youtube.com/watch?v=ffX0fTgJN0w&list=PLexHyfQ8DMuKqltG3cHT7Di4jhVl6L4YJ&index=12
## Video Solution by Punxsutawney Phil
https://youtu.be/8gGcj95rlWY
## Video Solution by OmegaLearn (Using Functions and Manipulations)
https://youtu.be/aGv99CLzguE

*~pi_is_3.14*
## Video Solution by TheBeautyofMath
https://youtu.be/IUJ_A9KiLEE

*~IceMatrix*
## Video Solution (Quick and Easy)
https://youtu.be/NbAu_STtcvA

*~Education, the Study of Everything*
## See also
