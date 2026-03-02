# 2025 AMC 12A Problem 12

> This problem is the same as [2025 AMC 10A #18](https://artofproblemsolving.com/wiki/index.php/2025_AMC_10A_Problems/Problem_18) and [2025 AMC 12A #12](https://artofproblemsolving.com/wiki/index.php/2025_AMC_12A_Problems/Problem_12).
## Problem
The *harmonic mean* of a collection of numbers is the reciprocal of the arithmetic mean of the reciprocals of the numbers in the collection. For example, the harmonic mean of 4,4, and 5 is

$$\frac{1}{\frac{1}{3}(\frac{1}{4}+\frac{1}{4}+\frac{1}{5})}=\frac{30}{7}.$$

What is the harmonic mean of all the real roots of the 4050th degree polynomial


$$\prod_{k=1}^{2025} (kx^2-4x-3)=(x^2-4x-3)(2x^2-4x-3)(3x^2-4x-3)...(2025x^2-4x-3)?$$


$\textbf{(A)}~-\frac{5}{3}\qquad\textbf{(B)}~-\frac{3}{2}\qquad\textbf{(C)}~-\frac{6}{5}\qquad\textbf{(D)}~-\frac{5}{6}\qquad\textbf{(E)}~-\frac{2}{3}$
## Solution 1
We will need to determine the sum of the reciprocals of the roots. To find the sum of the reciprocals of the roots p,q of the quadratic $ax^2+bx+c,$ we use Vieta's formulas. Recall that p+q = -b/a and pq = c/a. Therefore, $\frac{1}{p} + \frac{1}{q} = \frac{p+q}{pq} = \frac{\frac{-b}{a}}{\frac{c}{a}} = \frac{-b}{a} \cdot \frac{a}{c} = \frac{-b}{c},$
which doesn't depend on a.

The sum of the reciprocals of the roots of the quadratic $x^2-4x-3$ is $\frac{-(-4)}{-3} = -4/3$. The same is true for every quadratic in the form $ax^2-4x-3$. The sum of all the reciprocals of the roots of $ax^2+bx+c$ is 2025 $\cdot \left(-\frac{4}{3}\right).$

Because we have 2025 quadratics, there are 2 $\cdot 2025 = 4050$ total roots. Our answer is $\frac{1}{\frac{1}{4050}\cdot \frac{-4\cdot 2025}{3}} =\boxed{(B)\ -\dfrac{3}{2}}.$

*~lprado*

*~some edits by $i_am_not_suk_at_math$, zoyashaikh, keanu31415 (minor latex edits)*
## Solution 2 (similar to solution 1 but with quadratic formula)
We first find the general roots for quadratics in the form $kx^2-4x-3$. Using the quadratic formula we have

$$
\begin{align*}
x&=\frac{4 \pm \sqrt{16+12k}}{2k} \\
&= \frac{4\pm 2\sqrt{4+3k}}{2k} \\
&= \frac{2+\sqrt{4+3k}}{k}, \frac{2-\sqrt{4+3k}}{k} \\
\end{align*}
$$

Since we are asked to add the reciprocals of all 4050 roots in the harmonic mean, we will first add the general roots in terms of k. We have,

$$
\begin{align*}
\frac{k}{2+\sqrt{4+3k}} + \frac{k}{2-\sqrt{4+3k}} &= \frac{k(2-\sqrt{4+3k}) + k(2+\sqrt{4+3k})}{2^2-(\sqrt{4+3k})^2} \\
&= -\frac{4k}{3k}=-\frac{4}{3}. \\
\end{align*}
$$

Thus, each pair of roots add up to $-\frac{4}{3},$ and since there are 2025 pairs of roots, the harmonic mean of the desired expression is

$$
\begin{align*}
\frac{1}{\frac{1}{4050} \left (2025 \left (-\frac43 \right ) \right)} &= \frac{1}{\frac12 \left ( -\frac43 \right)} \\
& = \boxed{-\frac32}, \boxed{B}. \\
\end{align*}
$$


*~evanhliu2009*
## Solution 3 (Vieta's only)
We are asked to find $\frac{4050}{\sum_{i=1}^{4050}\frac{1}{i_1}}.$ By Vieta's, note that $r_1\cdotr_2\dotsr_{4050}=-\frac{3^{2025}}{2025!} =$ k (k is a constant). Then, note that we are asked to find $\frac{4050}{\sum_{i=1}^n \frac{\frac{k}{r_i}}{k}},$ and by Vieta's we get that $\sum_{i=1}^n \frac{k}{r_i} = \frac{2025 \cdot 4 \cdot 3^{2024}}{2025!},$ so substituting this in, we get $-\frac{4050}{\frac{\frac{2025 \cdot 4 \cdot 3^{2024}}{2025!}}{\frac{3^{2025}}{2025!}}} = -\frac{4050 \cdot 3^{2025}}{4050 \cdot 3^{2024} \cdot 2} = \boxed{-\frac{3}{2}}.$

*~ScoutViolet*
## Solution 4 (Vieta's Formulas)
We have:  $\prod_{k = 1}^{2025} (kx^{2} - 4x - 3) = (x^{2} - 4x - 3)(2x^{2} - 4x - 3)(3x^{2} - 4x - 3) \cdots (2025x^{2} - 4x - 3)$

So we can analyze each part of this "snake":

According to Vieta's Formulas:

For the first one: $x^{2}-4x - 3$:
We have:

$$
\begin{cases} x_1+x_2=\tfrac{4}{1}\\ x_1x_2=-\tfrac{3}{1} \end{cases}
$$

So we have:  $\dfrac{1}{x_1}+\dfrac{1}{x_2}=\dfrac{x_1+x_2}{x_1x_2}=-\dfrac{4}{3}$

For the second one: $2x^{2}-4x - 3$:
We have:

$$
\begin{cases} x_3+x_4=\tfrac{4}{2}\\ x_3x_4=-\tfrac{3}{2} \end{cases}
$$

So we have:  $\dfrac{1}{x_3}+\dfrac{1}{x_4}=\dfrac{x_3+x_4}{x_3x_4}=-\dfrac{4}{3}$

For the third one: $3x^{2}-4x - 3$:
We have:

$$
\begin{cases} x_5+x_6=\tfrac{4}{3}\\ x_5x_6=-\tfrac{3}{3} \end{cases}
$$

So we have:  $\dfrac{1}{x_5}+\dfrac{1}{x_6}=\dfrac{x_5+x_6}{x_5x_6}=-\dfrac{4}{3}$

......

Then we should check the last one. For the 2025th. one: $2025x^{2} - 4$x - 3:
We have:

$$
\begin{cases} x_{4049}+x_{4050}=\tfrac{4}{2025}\\ x_{4049}x_{4050}=-\tfrac{3}{2025} \end{cases}
$$

So we have:  $\dfrac{1}{x_{4049}}+\dfrac{1}{x_{4050}}=\dfrac{x_{4049}+x_{4050}}{x_{4049}x_{4050}}=-\dfrac{4}{3}$

$$
\begin{align*} \therefore H.M.&=\dfrac{1}{\dfrac{1}{4050}\sum_{i=1}^{4050}\dfrac{1}{x_i}}\\ &=\dfrac{4050}{2025\times\left(-\dfrac{4}{3}\right)}\\ &=-\dfrac{3}{2} \end{align*}
$$

Therefore, the final answer is $\color{red}\boxed{\color{black}-\dfrac{3}{2}}\color{black}.$

*~funkCCP*
## Solution 5 (Vietas Formulas)
For a general quadratic polynomial $ax^2 + bx +c = 0$ with roots p and q, the sum of the reciprocals is:

$$
\begin{align*}
\frac{1}{p} + \frac{1}{q} &= \frac{p+q}{pq} \\
\end{align*}
$$

Using Vieta's formulas (p+q = $-\frac{b}{a}$ and pq = $\frac{c}{a})$:

$$
\begin{align*}
\frac{1}{p} + \frac{1}{q} &= \frac{-\frac{b}{a}}{\frac{c}{a}} = -\frac{b}{c}
\end{align*}
$$

This result demonstrates that the sum of the reciprocals depends only on the coefficients b and c, and is independent of the leading coefficient a. Since the overall polynomial is a product of quadratics, and all these quadratics share the same b and c coefficients, the sum of the reciprocals for the roots of every individual quadratic is the same. We use the coefficients from one of the quadratics, which is $ax^2 -4x - 3 = 0$. Thus, b=-4 and c=-3.

$\sum (\text{reciprocals}) = -\frac{b}{c} = -\frac{(-4)}{(-3)} = -\frac{4}{3}$

We substitute the calculated sum of the reciprocals into the formula for the harmonic mean of 2 numbers:


$$\text{HM} = \frac{2}{-\frac{4}{3}} = 2 \times \left(-\frac{3}{4}\right) = -\frac{6}{4} = -\frac{3}{2}$$


The harmonic mean of the roots of any single quadratic is $-\frac{3}{2}.$ Since the sum of the reciprocals is the same for all quadratics, the harmonic mean of all the roots of the overall polynomial is also $\boxed{\textbf{(B) }\dfrac{-3}{2}}.$

*~Voidling*

*~small type fix by $i_am_not_suk_at_math$ (saharshdevaraju 13:39, 8 November 2025 (EST)saharshdevaraju)*
## Note
It is important to note that the question asks for the sum of all $\textbf{real}$ roots. We must therefore be careful in making sure that all roots are real and distinct. We can show that they are real because 16+$12k>0$ for all k>0 and we can show they are distinct because, if we assume that a is a root to both $px^2-4x-3$ and $qx^2-4x-3$ we would have $px^2-4x-3=qx^2-4x-3=0$ which implies $px^2=qx^2$ for all x, which is only possible if p=q.

*~Shadowleafy*
## Solution 6
Let the polynomial be f(x), and denote the 4050 roots to be $x_1,x_2,...,x_{4050}$. Hence, HM = $\dfrac{4050}{\frac{1}{x_1}+\frac{1}{x_2}+...\frac{1}{x_{4050}}}.$
We can multiply the numerator and denominator of this fraction by $x_1x_2...x_{4050}$ to create symmetric sums, which yields HM = $\dfrac{4050(x_1x_2...x_{4050})}{x_2x_3...x_{4050}+x_1x_3...x_{4050}+...+x_1x_2...x_{4049}}.$

By Vieta's Formulas, since f(x) is of even degree, the product of its roots, $x_1x_2...x_{4050}$, is just the constant term of f(x), call it $c_0$.
Likewise, the denominator of our harmonic mean, $x_2x_3...x_{4050}+x_1x_3...x_{4050}+...+x_1x_2...x_{4049}$, is the negated coefficient of x in the standard form of f(x). Let the coefficient of x in the standard form of f(x) be $c_1$.
Note that we do not have to worry about dividing by the coefficient of $x^{4050}$ when using Vieta's Formulas, as they will eventually cancel out in our harmonic mean calculations.

$$So, HM = \dfrac{4050c_0}{-c_1}.$$

The constant term in f(x) is just $c_0=(-3)^{2025}$. For the coefficient of the x term in f(x), there are $\dbinom{2025}{2024}=2025$ ways to choose 2024 of the trinomials to include a -3, and the one trinomial not chosen will include a -$4x$. Hence, c_$1=2025\cdot (-3)^{2024}\cdot (-4).$

Finally, HM=$\dfrac{4050\cdot(-3)^{2025}}{-2025\cdot (-3)^{2024}\cdot (-4)}=\dfrac{2\cdot(-3)}{-(-4)}=\boxed{\text{(A) }-\dfrac{3}{2}}.$

*~Tacos_are_yummy_1*
## Solution 7 (Cheese 🧀)
We can try replacing the 2025 in the problem with smaller numbers like 1 and 2. For 1, we have the quadratic $x^2-4x-3$. Using the quadratic formula, we have the roots are $2+\sqrt{7}$ and $2-\sqrt{7}$ The harmonic mean of these two is $\frac{2}{\frac{1}{2+\sqrt{7}} + \frac{1}{2-\sqrt{7}}}=\frac{2}{\frac{\sqrt{7}-2}{3}+\frac{2+\sqrt{7}}{-3}}=\frac{2}{\frac{-4}{3}}=-\frac{3}{2}.$

We notice that this is one of the answer choices. Also, given that the random choice of 2025, and that the rest of the answer choices are also simple fractions, we can safely guess that the answer is $\boxed{\textbf{(B)}~-\frac{3}{2}}$

*~andliu766*
## Solution 8 (Symmetry of Unweighted Means)
Note that all the roots are real since for each quadratic, $\Delta=b^2-4ac=(-4)^2-4k(-3)=16+12k>0$ for $k\ge 1.$ We will use the fundamental theorem of symmetric polynomials. By Vieta's formulas, we have for each quadratic $ax^2+bx+c=kx^2-4x-3$:

$$\frac{1}{r}+\frac{1}{s}=\frac{r+s}{rs}=\frac{-b/a}{c/a}=-\frac{b}{c}=-\frac{4}{3}$$

Thus, $\mathrm{HM}(r,s)=\frac{2}{\frac{1}{r}+\frac{1}{s}}=\frac{2}{-\frac{4}{3}}=-\frac{3}{2}.$ Since the unweighted harmonic mean is symmetric in its arguments, we can group terms to get

$$\mathrm{HM}(r_{1},r_{2},r_{3},\dots,r_{4050})=\mathrm{HM}\bigg(\mathrm{HM}(r_{1},r_{2}),\mathrm{HM}(r_{3},r_{4}),\dots,\mathrm{HM(r_{4049},r_{4050})}\bigg)=\boxed{\textbf{(B)}~-\frac{3}{2}}$$


Note: For an unweighted symmetric mean M, we have for d|n, $\mathrm{M}\{ x_{k} \}$_{$k=1}^{n}=\mathrm{M}\{ \mathrm{M}\{ x_{ds+k} \}$_{$k=1}^{d} \}$_{$s=0}^{n/d-1$} and $\mathrm{M}\{ \bar{x} \}$_{k}=$\bar{x}$ for constant mean $\bar{x}.$ You can also check this individually for HM: $\mathrm{HM}(x_{1},\dots,x_{n})=n(x_{1}^{-1}+\cdots+x_{n}^{-1})^{-1}=\frac{n}{d}\left$[ \underbrace{ $d\left(x_{1}^{-1}+\cdots+x_{d}^{-1}\right)+\cdots+d\left(x_{(n-1)d+1}^{-1}+\cdots+x_{n}^{-1}\right)$ }_{ $\frac{n}{d}\text{ terms}$ } $\right$]
or by checking arithmetic mean and using $\mathrm{HM}\{ x_{k} \}$_{k}=$\frac{1}{\mathrm{AM}\left\{ \frac{1}{x_{k}} \right\}_{k}}.$

*~imosilver*
## Solution 9 (Easy-ish to understand)
Note: I will try my best to make this solution look less intimidating to read as the other ones. This is my third time writing a solution, so I'm not very used to the $\LaTeX.$

The harmonic mean that the question is asking is $\frac{1}{\frac{r_1+r_2+...r_{4049}+r_{4050}}{4050}}$ where $r_i$ is between 1 and 4050 and is the reciprocal of all 4045 roots of the polynomial. All we need to find is the sum of the reciprocals of the roots and we can substitute that into this formula.

First of all, notice that there are 2025 quadratic polynomials. They each hold 2 out of the 4050 roots, and the sum of the reciprocals of their roots are $\frac{1}{a} + \frac{1}{b} = \frac{a+b}{ab}.$

Using Vieta's we get $\frac{a+b}{ab}=-\frac{4}{3}$ on the every quadratic because only the coefficient for $x^2$ changes. Also, a+b and ab have the denominator of a, so when they are divided, the quotient won't change. Therefore, the sums of the reciprocals of the quadratics sum to 2025 $\cdot \frac{-4}{3}.$

Now we can substitute: $\frac{1}{\frac{2025 \cdot \frac{-4}{3}}{4050}}.$ This gets us

$$
\begin{align}
\frac{1}{\frac{2025 \cdot \frac{-4}{3}}{4050}} &= \frac{1}{\frac{2025 \cdot (-4)}{3 \cdot 4050}} \\
&= \frac{1}{\frac{-8100}{12150}} \\
&= \frac{1}{\frac{-2}{3}} \\
&= 1 \cdot \frac{3}{-2} \\
&= -\frac{3}{2}
\end{align}
$$


Or...you could just solve the last part yourself easier than my solution!

*~slamgirls*
## Solution 10 (reciprocal roots)
We know that if for polynomial $ax^2 + bx + c$ is $r_1$ and $r_2$, then the polynomial with roots $\frac{1}{r_1}$ and $\frac{1}{r_2} (r$eciprocal roots) will be $cx^2 + bx + a$ where the coefficients are flipped (works for any degree polynomial, not just quadratic). Thus, using vieta's formula, the sum of the reciprocal roots for polynomial $kx^2 -4x - 3$ will be the sum of the roots for polynomial -$3x^2-4x$ + k which is - $\frac{-4}{-3}=- \frac{4}{3}.$

There are 2025 polynomials like this, so the sum of roots would be $2025\cdot (- \frac{4}{3}).$ Finding the harmonic mean, we get:

$$\frac{1}{\frac{1}{4050} \cdot \frac{-4\cdot 2025}{3}} = \frac{1}{\frac{-2}{3}}$$

$$Or \boxed{\textbf{(B) }-\frac{3}{2}}$$

*~tebby*
## Video Solution (In 1 Min)
https://youtu.be/hobODkqQG_s?si=MfbL5Fy0qSLhW81I ~ Pi Academy
## Chinese Video Solution
https://www.bilibili.com/video/BV1cLkQBpE4e/

*~metrixgo*
## Video Solution by Power Solve
https://www.youtube.com/watch?v=0MfWqKmxPHA
## Video Solution by SpreadTheMathLove
https://www.youtube.com/watch?v=dAeyV60Hu5c
## Video Solution by Thinking Feet
https://youtu.be/dpxN1zdVvP8
## Video Solution (using two common polynomial theorems)
https://youtu.be/XWADntUPzYk
## See Also
