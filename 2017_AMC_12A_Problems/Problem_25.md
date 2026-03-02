# 2017 AMC 12A Problem 25

## Problem
The vertices V of a centrally symmetric hexagon in the complex plane are given by

$$V=\left\{ \sqrt{2}i,-\sqrt{2}i, \frac{1}{\sqrt{8}}(1+i),\frac{1}{\sqrt{8}}(-1+i),\frac{1}{\sqrt{8}}(1-i),\frac{1}{\sqrt{8}}(-1-i) \right\}.$$

For each j, $1\leqj\leq 12,$ an element $z_j$ is chosen from V at random, independently of the other choices. Let P={$\prod$}_{$j=1}^{12}z_j$ be the product of the 12 numbers selected. What is the probability that P=-1?

$\textbf{(A) } \dfrac{5\cdot11}{3^{10}} \qquad \textbf{(B) } \dfrac{5^2\cdot11}{2\cdot3^{10}} \qquad \textbf{(C) } \dfrac{5\cdot11}{3^{9}} \qquad \textbf{(D) } \dfrac{5\cdot7\cdot11}{2\cdot3^{10}} \qquad \textbf{(E) } \dfrac{2^2\cdot5\cdot11}{3^{10}}$
## Solution 1
It is possible to solve this problem using elementary counting methods. This solution proceeds by a cleaner generating function.

We note that $\pm \sqrt{2}$i both lie on the imaginary axis and each of the $\frac{1}{\sqrt{8}}(\pm 1\pm i)$ have length $\frac{1}{2}$ and angle of odd multiples of $\pi/4, i.e. \pi/4,3\pi/4,5\pi/4,7\pi/4$. When we draw these 6 complex numbers out on the complex plane, we get a crystal-looking thing. Note that the total number of ways to choose 12 complex numbers is $6^{12}$. Now we count the number of good combinations.

We first consider the lengths. When we multiply 12 complex numbers together, their magnitudes multiply. Suppose we have n of the numbers $\pm \sqrt{2}$i; then we must have $\left(\sqrt{2}\right)^n\cdot\left(\frac{1}{2}\right)^{12-n}=1 \Longrightarrown=8$. Having $n=8$ will take care of the length of the product; now we need to deal with the angle.

We require $\sum\theta\equiv\pi \mod 2\pi.$ Letting z be $e^{i\pi/4}$, we see that the angles we have available are $\{z^1,z^2,z^3,z^5,z^6,z^7\}$, where we must choose exactly 8 angles from the set $\{z^2,z^6\}$ and exactly 4 from the set $\{z^1,z^3,z^5,z^7\}$. If we found a good combination where we had $a_i$ of each angle $z^i,$ then the amount this would contribute to our count would be $\binom{12}{4,8}\cdot\binom{8}{a_2,a_6}\cdot\binom{4}{a_1,a_3,a_5,a_7}.$ We want to add these all up. We proceed by generating functions.

Consider ($t_2x^2+t_6x^6)^8(t_1x^1+t_3x^3+t_5x^5+t_7x^7)^4$. The expansion will be of the form $\sum_i\left(\sum_{\sum a=i} \binom{8}{a_2,a_6}\binom{4}{a_1,a_3,a_5,a_7}{t_1}^{a_1}{t_2}^{a_2}{t_3}^{a_3}{t_5}^{a_5}{t_6}^{a_6}{t_7}^{a_7}x^i\right).$ Note that if we reduced the powers of x mod 8 and fished out the coefficient of $x^4$ and plugged in $t_i=$1\ $\forall$\,i (and then multiplied by $\binom{12}{4,8})$ then we would be done. Since plugging in $t_i=1$ doesn't affect the x's, we do that right away. The expression then becomes $x^{20}(1+x^4)^8(1+x^2+x^4+x^6)^4=x^{20}(1+x^4)^{12}(1+x^2)^4=x^4(1+x^4)^{12}$$(1+x^2)^4,$ where the last equality is true because we are taking the powers of x mod 8. Let [$x^n$]f(x) denote the coefficient of x^n in f(x). Note [$x^$4] $x^4(1+x^4)^{12}(1+x^2)^4=[$x^0](1+$x^4)^{12}(1+x^2)^4$. We use the roots of unity filter, which states $\text{terms of }$f(x)$\text{ that have exponent congruent to }k\text{ mod }n=\frac{1}{n}\sum_{m=1}^n \frac{f(z^mx)}{z^{mk}},$ where $z=e^{i\pi/n}$. In our case $k=0$, so we only need to find the average of the $f(z^mx)$'s.

$$
\begin{align*} z^0 &\Longrightarrow (1+x^4)^{12}(1+x^2)^4,\\ z^1 &\Longrightarrow (1-x^4)^{12}(1+ix^2)^4,\\ z^2 &\Longrightarrow (1+x^4)^{12}(1-x^2)^4,\\ z^3 &\Longrightarrow (1-x^4)^{12}(1-ix^2)^4,\\ z^4 &\Longrightarrow (1+x^4)^{12}(1+x^2)^4,\\ z^5 &\Longrightarrow (1-x^4)^{12}(1+ix^2)^4,\\ z^6 &\Longrightarrow (1+x^4)^{12}(1-x^2)^4,\\ z^7 &\Longrightarrow (1-x^4)^{12}(1-ix^2)^4. \end{align*}
$$

We plug in $x=1$ and take the average to find the sum of all coefficients of $x^{\text{multiple of 8}}$. Plugging in $x=1$ makes all of the above zero except for $z^0$ and z^4. Averaging, we get $2^{14}$. Now the answer is simply $\frac{\binom{12}{4,8}}{6^{12}}\cdot 2^{14}=\boxed{\textbf{(E)} ~\frac{2^2\cdot 5\cdot 11}{3^{10}}}.$
## Solution 2
By changing $z_1 to -z_1$, we can give a bijection between cases where P=-1 and cases where P=1, so we'll just find the probability that P=$\pm 1$ and divide by 2 in the end. Multiplying the hexagon's vertices by i doesn't change P, and switching any $z_j$ with -$z_j$ doesn't change the property P=$\pm 1,$ so the probability that P=$\pm1$ remains the same if we only select our $z_j$'s at random from

$$\left\{a= \sqrt 2,\quad b=\frac1{\sqrt{8}}(1+i),\quad c=\frac1{\sqrt{8}}(1-i)\right\}.$$

Since |a|=$\sqrt2$ and |b|=|c|=$\frac12,$ we must choose a exactly 8 times to make |P|=1. To ensure P is real, we must either choose b 4 times, c 4 times, or both b and c 2 times. This gives us a total of

$$2\binom{12}{4}+\binom{12}{2}\binom{10}{2}=(12\cdot 11\cdot 10\cdot 9)\left(\frac1{12}+\frac14\right)=(2^3\cdot 3^3\cdot 5\cdot 11)\frac13$$

good sequences $z_1,\dots,z_{12},$ and hence the final result is

$$\frac12\cdot \frac{2^3\cdot 3^2\cdot 5\cdot 11}{3^{12}}=\boxed{\textbf{(E)} ~\frac{2^2\cdot 5\cdot 11}{3^{10}}}.$$

## Solution 3
We use generating functions and a roots of unity filter.
Notice that all values in V are eighth roots of unity multiplied by a constant.  Let x be a primitive eighth root of unity $(e^{\frac{i\pi}{4}})$.  The numbers in V are then $\left\{ \frac{x}{2},x^2\sqrt2,\frac{x^3}{2},\frac{x^5}{2},x^6\sqrt2,\frac{x^7}{2} \right\}$.  To have P=-1, we must have that |P|=1, so eight of the $(z_i)$ must belong to
$$\left \{ x^2\sqrt2,x^6\sqrt2 \right\}$$
and the other four must belong to
$$\left \{ \frac{x}{2},\frac{x^3}{2},\frac{x^5}{2},\frac{x^7}{2} \right\}$$
So, we write the generating function
$$\left (x^2 +x^6 \right )^8 \left (x+x^3+x^5+x^7 \right )^4$$
to describe the product.  Note that this assumes that the $(z_i)$ that belong to $\left\{ x^2\sqrt2,x^6\sqrt2 \right\}$ come first, so we will need to multiply by $\binom{12}{4}$ at the end.  We now apply a roots of unity filter to find the sum of the coefficients of the exponents that are $4\pmod{8},$ or equivalently the coefficients of the powers that are multiples of 8 of the following function:
$$P(x)=\left (x^2 +x^6 \right )^8 \left (x+x^3+x^5+x^7 \right )^4x^4$$
Let $\zeta=e^{\frac{i\pi}{4}}.$  We are looking for $\frac{P(1)+P(\zeta)+P(\zeta^2)+P(\zeta^3)+P(\zeta^4)+P(\zeta^5)+P(\zeta^6)+P(\zeta^7)}{8}.  P(1)=P(-1)=2^{16},$ and all of the rest are equal to 0.  So, we get an answer of $\frac{2^{16}+2^{16}}{8\cdot 6^{12}}=\frac{2^{14}}{6^{12}}=\frac{2^2}{3^{12}}.$  But wait!  We need to multiply by $\binom{12}{4} =\frac{12\cdot11\cdot10\cdot9}{4\cdot3\cdot2\cdot1}=5\cdot9\cdot11.$  So, the answer is $\boxed{\text{\textbf{(E) }} \frac{2^2\cdot5\cdot11}{3^{10}} }$
## Remark
Here is a really good post about the Roots of Unity Filter: https://artofproblemsolving.com/community/c1340h1003741_roots_of_unity_filter
## Solution 4
We can write the points in polar form (r, $\theta)$ as
V = $\left\{ \left(\sqrt{2}, \frac{\pi}{2}\right), \left(\sqrt{2}, \frac{3\pi}{2}\right), \left(\frac{1}{2}, \frac{\pi}{4}\right), \left(\frac{1}{2}, \frac{3\pi}{4}\right), \left(\frac{1}{2}, \frac{5\pi}{4}\right), \left(\frac{1}{2}, \frac{7\pi}{4}\right)\right\}$.Note that when multiplying complex numbers, the r's multiply and the $\theta$'s add, and since -1 = (1, $\pi),$ we need 8 complex numbers with $r =\sqrt{2} = 2^{0.5}$ and 4 with $r =\frac{1}{2} = 2^{-1}.$ By binomial distribution, the probability of this occurring is $\dbinom{12}{4} \left(\frac{1}{3}\right)^8 \left(\frac{2}{3}\right)^4.$ For the $\theta$ part, note that $\frac{4\theta}{\pi}$ must be congruent to 4 $\mod 8,$  and by using simple symmetry, the probability of the aforementioned occurring is $\frac{1}{4}.$  This is since $2a+6b$ is even for all a + $b =8$,  and the number of ordered quadruples $(a_1, a_2, a_3, a_4)$ such that $a_i\in\{1, 3, 5, 7\}$ for all 1 $\leq$ i $\leq 4$ and $a_1+a_2 + a_3+a_4\equiv 2k \mod 8$ is the same for all 1 $\leq$ k $\leq 4,$ again by using symmetry. Thus, our probability is $\left(\frac{1}{4}\right) \left(\frac{1}{3}\right)^8 \left(\frac{2}{3}\right)^4 \dbinom{12}{4} = \frac{2^2}{3^{12}} \dbinom{12}{4} = \boxed{\textbf{(E)} ~\frac{2^2\cdot 5\cdot 11}{3^{10}}}$

*~fidgetboss_4000*
## Solution 5 (Simple)
The absolute value of the first two complex numbers is $\sqrt{2}$ while the absolute value of the latter four is $\frac12.$ For the absolute value of the product to be 1, we need 8 elements with absolute value $\sqrt{2}$ and 4 elements with absolute value of $\frac12.$

We pick 8 elements from A = $\left\{ \sqrt{2}i,-\sqrt{2}i\right\}$ and 4 elements from B = $\left\{\frac{1}{\sqrt{8}}(1+i),\frac{1}{\sqrt{8}}(-1+i),\frac{1}{\sqrt{8}}(1-i),\frac{1}{\sqrt{8}}(-1-i) \right\}$. We also need to choose which 8 of $z_j$ will be chosen from A which gives us {12 $\choose 8} \cdot 2^8 \cdot 4^4$ cases. However, suppose we have chosen 11 elements and we need to choose one more element from B. The product of these 11 elements can have any of these values: $\left\{ 2\mathrm{cis}(\frac{\pi}{4}), 2\mathrm{cis}(\frac{3\pi}{4}), 2\mathrm{cis}(\frac{5\pi}{4}), 2\mathrm{cis}(\frac{7\pi}{4}), \right\}$. For either of these values, there is just one value of $z_{12}\in B$ such that P = -1 so we must divide by 4 which gives {12 $\choose 8} \cdot 2^8 \cdot 4^3$ cases.

Because there are $6^{12}$ ways to pick any 12 elements, our probability is simply $\frac{{12 \choose 8} \cdot 2^8 \cdot 4^3}{6^{12}} = \frac{2^2}{3^{12}}$ {12 $\choose 8} = \boxed{\text{\textbf{(E) }} \frac{2^2\cdot5\cdot11}{3^{10}} }$

*~Zeric*
## Solution 6 (Casework)
Let a = $\sqrt{2}$i, b = $\frac{1}{\sqrt{8}}(1+i),$ c = $\frac{1}{\sqrt{8}}(-1+i). \bar{a} = -\sqrt{2}$i, $\bar{b} = \frac{1}{\sqrt{8}}(1-i), \bar{c} = \frac{1}{\sqrt{8}}(-1-i)$

The magnitude of $\left\{ a, \bar{a} \right\}$ is $\sqrt{2},$ while the magnitude of $\left\{ b, \bar{b}, c, \bar{c} \right\}$ is $\frac12.$ For the product's magnitude to be 1, we need 8 elements from $\left\{ a, \bar{a} \right\}$, and 4 elements from $\left\{ b, \bar{b}, c, \bar{c} \right\}$.

The product of 8 elements from $\left\{ a, \bar{a} \right\}$ will be either 16 or -16. The product of 4 elements from $\left\{ b, \bar{b}, c, \bar{c} \right\}$ will be either $\frac{1}{16}$ or $-\frac{1}{16}.$

$\text{Combinations of } \left$$\{ a, \bar{a} \right\}\text{ multiplied to 16 is} \left$$\{ a^8, \bar{a}^8, a^2\bar{a}^6, a^6\bar{a}^2, a^4\bar{a}^4 \right\}$

$\text{Combinations of } \left$$\{ a, \bar{a} \right\}\text{ multiplied to -16 is} \left$$\{ a\bar{a}^7, a^7\bar{a}, a^5\bar{a}^3, a^3\bar{a}^5 \right\}$

$\text{Combinations of } \left$$\{ b, \bar{b}, c, \bar{c} \right\}\text{ multiplied to } \frac{1}{16} \text{ is} \left$$\{ b^2\bar{b}^2, c^2\bar{c}^2, b^2c^2, \bar{b}^2\bar{c}^2, b\bar{b}c\bar{c}, b^3\bar{c}, b\bar{c}^3, \bar{b}^3c, \bar{b}c^3 \right\}$

$\text{Combinations of } \left$$\{ b, \bar{b}, c, \bar{c} \right\}\text{ multiplied to } -\frac{1}{16} \text{ is} \left$$\{ b^2\bar{b}c, b\bar{b}^2\bar{c}, bc^2\bar{c}, \bar{b}c\bar{c}^2, b^4, c^4, \bar{b}^4, \bar{c}^4, b^2\bar{c}^2, \bar{b}^2c^2 \right\}$

Notice that the denominator of the desired probability is $6^{12}$, therefore, the numerator of the desired probability will be the sum of the permutations of all combinations that multiply to -1.

Multiplying combinations of $\left\{ a, \bar{a} \right\}$ multiplied to 16 with combinations of $\left\{ b, \bar{b}, c, \bar{c} \right\}$ multiplied to $-\frac{1}{16}$ gives the desired product -1. Similarly, multiplying combinations of $\left\{ a, \bar{a} \right\}$ multiplied to -16 with combinations of $\left\{ b, \bar{b}, c, \bar{c} \right\}$ multiplied to $\frac{1}{16}$ also gives the desired product -1.

Cases with combinations of $\left\{ a, \bar{a} \right\}$ multiplied to 16 and combinations of $\left\{ b, \bar{b}, c, \bar{c} \right\}$ multiplied to $-\frac{1}{16}$:
 Case 1:

$$
\left\{ a^8, \bar{a}^8 \right\} \cdot \left\{ b^2\bar{b}c, b\bar{b}^2\bar{c}, bc^2\bar{c}, \bar{b}c\bar{c}^2 \right\}
\frac{12!}{8!2!} \cdot 2 \cdot 4 = \frac{12!}{8!} \cdot 4
$$


 Case 2:

$$
\left\{ a^8, \bar{a}^8 \right\} \cdot \left\{ b^4, c^4, \bar{b}^4, \bar{c}^4 \right\}
\frac{12!}{8!4!} \cdot 2 \cdot 4 = \frac{12!}{8!} \cdot \frac13
$$


 Case 3:

$$
\left\{ a^8, \bar{a}^8 \right\} \cdot \left\{ b^2\bar{c}^2, \bar{b}^2c^2 \right\}
\frac{12!}{8!2!2!} \cdot 2 \cdot 2 = \frac{12!}{8!}
$$


 Case 4:

$$
\left\{ a^2\bar{a}^6, a^6\bar{a}^2 \right\} \cdot \left\{ b^2\bar{b}c, b\bar{b}^2\bar{c}, bc^2\bar{c}, \bar{b}c\bar{c}^2 \right\}
\frac{12!}{6!2!2!} \cdot 2 \cdot 4 = \frac{12!}{6!} \cdot 2
$$


 Case 5:

$$
\left\{ a^2\bar{a}^6, a^6\bar{a}^2 \right\} \cdot \left\{ b^4, c^4, \bar{b}^4, \bar{c}^4 \right\}
\frac{12!}{6!2!4!} \cdot 2 \cdot 4 = \frac{12!}{6!} \cdot \frac16
$$


 Case 6:

$$
\left\{ a^2\bar{a}^6, a^6\bar{a}^2 \right\} \cdot \left\{ b^2\bar{c}^2, \bar{b}^2c^2 \right\}
\frac{12!}{6!2!2!2!} \cdot 2 \cdot 2 = \frac{12!}{6!} \cdot \frac12
$$


 Case 7:

$$
\left\{ a^4\bar{a}^4 \right\} \cdot \left\{ b^2\bar{b}c, b\bar{b}^2\bar{c}, bc^2\bar{c}, \bar{b}c\bar{c}^2 \right\}
\frac{12!}{4!4!2!} \cdot 4 = \frac{12!}{4!} \cdot \frac{1}{12}
$$


 Case 8:

$$
\left\{ a^4\bar{a}^4 \right\} \cdot \left\{ b^4, c^4, \bar{b}^4, \bar{c}^4 \right\}
\frac{12!}{4!4!4!} \cdot 4 = \frac{12!}{4!} \cdot \frac{1}{144}
$$


 Case 9:

$$
\left\{ a^4\bar{a}^4 \right\} \cdot \left\{ b^2\bar{c}^2, \bar{b}^2c^2 \right\}
\frac{12!}{4!4!2!2!} \cdot 2 = \frac{12!}{4!} \cdot \frac{1}{48}
$$


Cases with combinations of $\left\{ a, \bar{a} \right\}$ multiplied to -16 and combinations of $\left\{ b, \bar{b}, c, \bar{c} \right\}$ multiplied to $\frac{1}{16}$:
 Case 10:

$$
\left\{ a\bar{a}^7, a^7\bar{a} \right\} \cdot \left\{ b^2\bar{b}^2, c^2\bar{c}^2, b^2c^2, \bar{b}^2\bar{c}^2 \right\}
\frac{12!}{7!2!2!} \cdot 2 \cdot 4 = \frac{12!}{7!} \cdot 2
$$


 Case 11:

$$
\left\{ a\bar{a}^7, a^7\bar{a} \right\} \cdot \left\{ b\bar{b}c\bar{c} \right\}
\frac{12!}{7!} \cdot 2
$$


 Case 12:

$$
\left\{ a\bar{a}^7, a^7\bar{a} \right\} \cdot \left\{ b^3\bar{c}, b\bar{c}^3, \bar{b}^3c, \bar{b}c^3 \right\}
\frac{12!}{7!3!} \cdot 2 \cdot 4 = \frac{12!}{7!} \cdot \frac{4}{3}
$$


 Case 13:

$$
\left\{ a^5\bar{a}^3, a^3\bar{a}^5 \right\} \cdot \left\{ b^2\bar{b}^2, c^2\bar{c}^2, b^2c^2, \bar{b}^2\bar{c}^2 \right\}
\frac{12!}{5!3!2!2!} \cdot 2 \cdot 4 = \frac{12!}{6!} \cdot 2
$$


 Case 14:

$$
\left\{ a^5\bar{a}^3, a^3\bar{a}^5 \right\} \cdot \left\{ b\bar{b}c\bar{c} \right\}
\frac{12!}{5!3!} \cdot 2 = \frac{12!}{6!} \cdot 2
$$


 Case 15:

$$
\left\{ a^5\bar{a}^3, a^3\bar{a}^5 \right\} \cdot \left\{ b^3\bar{c}, b\bar{c}^3, \bar{b}^3c, \bar{b}c^3 \right\}
\frac{12!}{5!3!3!} \cdot 2 \cdot 4 = \frac{12!}{6!} \cdot \frac{4}{3}
$$


Sum of the permutations of all combinations that multiply to -1:

$$
\begin{align*} &\frac{12!}{8!} \cdot 4 + \frac{12!}{8!} \cdot \frac13 + \frac{12!}{8!} + \frac{12!}{6!} \cdot 2 + \frac{12!}{6!} \cdot \frac16 + \frac{12!}{6!} \cdot \frac12 + \frac{12!}{4!} \cdot \frac{1}{12} + \frac{12!}{4!} \cdot \frac{1}{144} + \frac{12!}{4!} \cdot \frac{1}{48} + \frac{12!}{7!} \cdot 2 + \frac{12!}{7!} \cdot 2 + \frac{12!}{7!} \cdot \frac{4}{3}\\ &+ \frac{12!}{6!} \cdot 2 + \frac{12!}{6!} \cdot 2 + \frac{12!}{6!} \cdot \frac{4}{3} \\ &= \frac{12!}{7!} \left( \frac{1}{2} + \frac{1}{24} + \frac{1}{8} + 14 + \frac{7}{6} + \frac{7}{2} + \frac{35}{2} + \frac{35}{24} + \frac{35}{8} + 2 + 2 + \frac{4}{3} + 14 + 14 + \frac{28}{3} \right)\\ &= \frac{12!}{7!} \cdot \frac{256}{3} \end{align*}
$$


$$\frac{ \frac{12!}{7!} \cdot \frac{256}{3} }{ 6^{12} } = \boxed{\textbf{(E)} ~\frac{2^2\cdot 5\cdot 11}{3^{10}}}$$


~[https://artofproblemsolving.com/wiki/index.php/User:Isabelchen isabelchen]
## Video Solution by Richard Rusczyk
https://www.youtube.com/watch?v=CfO4zIeYrSY
## See Also
