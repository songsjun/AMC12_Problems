# 2002 AMC 12B Problem 23

## Problem
In $\triangle ABC,$ we have AB = 1 and AC = 2. Side $\overline{BC}$ and the [median](https://artofproblemsolving.com/wiki/index.php/Median_of_a_triangle) from A to $\overline{BC}$ have the same length. What is BC?


$$\mathrm{(A)}\ \frac{1+\sqrt{2}}{2} \qquad\mathrm{(B)}\ \frac{1+\sqrt{3}}2 \qquad\mathrm{(C)}\ \sqrt{2} \qquad\mathrm{(D)}\ \frac 32 \qquad\mathrm{(E)}\ \sqrt{3}$$

## Solution
### Solution 1: Pythagorean Theorem
> [Asymptote diagram - not rendered in Markdown]

```asy
unitsize(4cm); pair A, B, C, D, M; A = (1.768,0.935); B = (1.414,0); C = (0,0); D = (1.768,0); M = (0.707,0); draw(A--B--C--cycle); draw(A--D); draw(D--B); draw(A--M); label("$A$",A,N); label("$B$",B,S); label("$C$",C,S); label("$D$",D,S); label("$M$",M,S); label("$x$",(A+D)/2,E); label("$y$",(B+D)/2,S); label("$a$",(C+M)/2,S); label("$a$",(M+B)/2,S); label("$2a$",(A+M)/2,SE); label("$1$",(A+B)/2,SE); label("$2$",(A+C)/2,NW); draw(rightanglemark(B,D,A,3));
```


Let D be the foot of the altitude from A to $\overline{BC}$ extended past B. Let AD = x and BD = y.
Using the Pythagorean Theorem, we obtain the equations


$$
\begin{align*} x^2 + y^2 = 1 \hspace{0.5cm}(1)\\ x^2 + y^2 + 2ya + a^2 = 4a^2 \hspace{0.5cm}(2)\\ x^2 + y^2 + 4ya + 4a^2 = 4 \hspace{0.5cm}(3) \end{align*}
$$


Subtracting (1) equation from (2) and (3), we get


$$
\begin{align*} 2ya + a^2 = 4a^2 - 1 \hspace{0.5cm}(4)\\ 4ya + 4a^2 = 3 \hspace{0.5cm}(5) \end{align*}
$$


Then, subtracting 2 $\times (4)$ from (5) and rearranging, we get $10a^2 = 5$, so BC = $2a=\sqrt{2}\Rightarrow \boxed{\mathrm{(C)}}$

*~greenturtle 11/28/2017*
### Solution 2: Law of Cosines
[Image:2002_$12B_AMC-23$.png](https://artofproblemsolving.com/wiki/index.php/Image:2002_12B_AMC-23.png)

Let D be the foot of the median from A to $\overline{BC},$ and we let AD = BC = $2a$. Then by the [Law of Cosines](https://artofproblemsolving.com/wiki/index.php/Law_of_Cosines) on $\triangle ABD, \triangle ACD,$ we have

$$
\begin{align*} 1^2 &= a^2 + (2a)^2 - 2(a)(2a)\cos ADB \\ 2^2 &= a^2 + (2a)^2 - 2(a)(2a)\cos ADC \end{align*}
$$


Since $\cos ADC = \cos (180 - ADB) = -\cos ADB,$ we can add these two equations and get

$$5 = 10a^2$$

Hence $a =\frac{1}{\sqrt{2}}$ and BC = $2a=\sqrt{2} \Rightarrow \mathrm{(C)}.$
### Solution 3: Stewart's Theorem
From [Stewart's Theorem](https://artofproblemsolving.com/wiki/index.php/Stewart's_Theorem), we have (2)(1/2)a(2) + (1)(1/2)a(1) = (a)(a)(a) + (1/2)a(a)(1/2)a. Simplifying, we get $(5/4)a^3 = (5/2)a\implies (5/4)a^2 = 5/2 \impliesa^2 = 2 \impliesa =\boxed{\sqrt{2}}.$
- awu2014
### Solution 4: Pappus's Median Theorem
There is a theorem in geometry known as Pappus's Median Theorem. It states that if you have $\triangle{ABC},$ and you draw a median from point A to side BC (label this as M), then: $(AM)^2 =\dfrac{2(b^2) + 2(c^2) - (a^2)}{4}.$ Note that b is the length of side $\overline{AC},$ c is the length of side $\overline{AB},$ and a is length of side $\overline{BC}.$ Let MB = MC = x. Then AM = $2x$. Now, we can plug into the formula given above: AM = $2x$, $b = 2, c = 1$, and $a =2x$. After some simple algebra, we find $x =\dfrac{\sqrt{2}}{2}.$ Then, BC = $\boxed{\sqrt{2}} \implies \boxed{C}.$

*~Flames*

Note: Pappus's Median Theorem is just a special case of Stewart's Theorem, with m = n. ~Puck_0
aka Apollonius' Theorem - Orion 2010
### Video Solution by TheBeautyofMath
https://youtu.be/jEVMgWKQIW8

*~IceMatrix*
## See also
