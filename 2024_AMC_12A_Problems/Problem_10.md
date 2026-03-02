# 2024 AMC 12A Problem 10

## Problem
Let $\alpha$ be the radian measure of the smallest angle in a 3{-}4{-}5 right triangle. Let $\beta$ be the radian measure of the smallest angle in a 7{-}24{-}25 right triangle. In terms of $\alpha,$ what is $\beta$?

$\textbf{(A) }\frac{\alpha}{3}\qquad \textbf{(B) }\alpha - \frac{\pi}{8}\qquad \textbf{(C) }\frac{\pi}{2} - 2\alpha \qquad \textbf{(D) }\frac{\alpha}{2}\qquad \textbf{(E) }\pi - 4\alpha\qquad$
## Solution 1
We are given that $\tan\alpha=\frac{3}{4} \text{ and } \tan\beta=\frac{7}{24}.$
We have

$$
\begin{align*} \tan(\alpha+\beta) &= \frac{\tan\alpha+\tan\beta}{1-\tan\alpha\tan\beta} \\ &= \frac{\frac{3}{4}+\frac{7}{24}}{1-\frac{3}{4} \cdot \frac{7}{24}} \\ &= \frac{4}{3}. \end{align*}
$$

It follows that

$$
\begin{align*} \alpha+\beta&=\tan^{-1}\left(\frac{4}{3}\right) \\ &=\frac{\pi}{2}-\tan^{-1}\left(\frac{3}{4}\right) \\ &=\frac{\pi}{2}-\alpha. \end{align*}
$$

Therefore, the answer is
$$\beta=\boxed{\textbf{(C) }\frac{\pi}{2}-2\alpha}.$$
*~lptoggled*
## Solution 2: Scaling and combining triangles
We can scale the 3-4-5 triangle up by a factor of 6 to make its side lengths 18,24, and 30, then glue its side of length 24 to the corresponding side in the 7-24-25 triangle:


> [Asymptote diagram - not rendered in Markdown]

```asy
pair A = (0,0); pair B = (18,0); pair C = (25,0); pair D = (18,24); draw(A--C--D--cycle); draw(B--D); draw(rightanglemark(C,B,D,50)); label("A", A, SW); label("B", B, S); label("C", C, SE); label("D", D, N); label("18", A--B, S); label("7", B--C, S); label("25", C--D, NE); label("30", D--A, NW); label("24", B--D, W); label("$\alpha$", D, 6*dir(250)); label("$\beta$", D, 9*dir(278)); label("$\frac{\pi}{2} - \alpha$", A, 4*dir(25));
```


Angles $\angle DAB$ and $\angle BDA$ are complementary in $\triangle ABD,$ so $\angle DAB = \frac{\pi}{2} - \alpha.$ We also have AC = $18 + 7 = 25$ = CD, so $\triangle ACD$ is isosceles. That means that its base angles $\angle CDA$ and $\angle CAD$ are congruent, so $\alpha + \beta = \frac{\pi}{2} - \alpha,$ and hence $\beta = \boxed{\textbf{(C) }\frac{\pi}{2}-2\alpha}.$

*~MartianTom*
## Solution 3: Trial and Error
Another approach to solving this problem is trial and error, comparing the sine of the answer choices with $\sin\beta = \frac{7}{25}.$ Starting with the easiest sine to compute from the answer choices (option choice D). We get:

$$
\sin{\left(\frac{\alpha}{2}\right)} = \sqrt{\frac{1 - \cos{\alpha}}{2}}
= \sqrt{\frac{1 - \frac{4}{5}}{2}}
= \sqrt{\frac{1}{10}}
\neq \frac{7}{25}
$$


The next easiest sine to compute is option choice C.

$$
\sin{\left(\frac{\pi}{2} - 2\alpha\right)} = \sin{\left(\frac{\pi}{2}\right)}\cos{\left(2\alpha\right)}
=\cos{2\alpha}
=\cos^2{\alpha} - \sin^2{\alpha}
=\frac{16}{25} - \frac{9}{25}
=\frac{7}{25}
$$


Since $\sin\left(\frac{\pi}{2} - 2\alpha\right)$ is equal to $\sin\beta,$ option choice C is the correct answer. ~amshah
## Solution 4:

$$\sin(B) = \frac{24}{25} = 2 \cdot \frac{12}{25} = 2 \cdot \frac{3}{5} \cdot \frac{4}{5} = 2 \cdot \sin(A) \cdot \cos(A) = \sin(2A) = \cos(90^{\circ} - 2A)$$


Therefore $\beta=\boxed{(C) \frac{\pi}{2} -2\alpha}$

~[https://artofproblemsolving.com/wiki/index.php/User:Cyantist luckuso]

Added Note: It should be $\cos(B) = \frac{24}{25} = 2 \cdot \frac{12}{25} = 2 \cdot \frac{3}{5} \cdot \frac{4}{5} = 2 \cdot \sin(A) \cdot \cos(A) = \sin(2A) = \cos(90^{\circ} - 2A). \sin(B)$ is actually $\frac{7}{25}$!

Hello $2d$ world (talk) 08:45, 22 August 2025 (EDT)
## Solution 5: Ptolemy (no trig)
Let AB have length 15, BC have length 20, AC length 25, AD length 7 and CD length 24. Let x be the measure of segment BD. Thus the measure of angle ACB is $\alpha$ and the measure of angle ACD is $\beta. ABCD$ is a cyclic quadrilateral because angle ABC and angle ADC are right angles. Using Ptolemy's theorem on this quadrilateral yields $25x = 15*24 + 7*20 = 500$, or $x = 20$. This means triangle CBD is isoceles. The perpendicular bisector of CD passes through the center (O) of the circle on which ABCD lies and also passes through B. Let the intersection of the perpendicular bisector of CD and CD be point P. The measure of angle OBC is the same as the measure of the angle OCB which is $\alpha,$ so the measure of angle BOC is {$\pi$} - {2}{$\alpha$}, so the measure of angle COP is {2}{$\alpha$}. Triangle COP is a right triangle with angle OCP being the same as angle ACD ($\beta),$ angle COP being {2}{$\alpha$}, and angle CPO being $\frac{\pi}{2}.$
So:
$$\beta + {2}\alpha + \frac{\pi}{2} = \pi$$
$\beta=\boxed{(C) \frac{\pi}{2} -2\alpha}$~Ilaggo2432
## Solution 6(rough value)
given in the question,sin(a)is 3/5 and sin (b) is 7/25,estimate the angle by using the arcsin function. arcsin 3/5 is around 0.643 rad and arcsin 7/25 is around 0.283. Note that pi/2 is closest to 1.57 rad, try one by one and option c suggests that 1.$57=2(0.643)+0.283$. My first amc 12 edit
## Solution 7 (Angle Addition)
$\sin(\alpha)\cos(\beta) + \sin(\beta)\cos(\alpha) = \sin(\alpha+\beta) = \frac{4}{5}.$ Noticing $\frac{4}{5} = \cos(\alpha) = \sin\left(\frac{\pi}{2}-\alpha\right)$ gives us $\alpha + \beta = \frac{\pi}{2} - \alpha$ so $\boxed{\textbf{(C) }\dfrac{\pi}{2} - 2\alpha}$
~$KEVIN_LIU$
## Solution 8 (Geometry Solution Without Words)
$$\angle A+ \angle B+ \angle A = \frac{\pi}{2}$$
Therefore $\beta=\boxed{(C) \frac{\pi}{2} -2\alpha}$
~[https://artofproblemsolving.com/wiki/index.php/User:Cyantist luckuso]

[thumb|center|400px|](https://artofproblemsolving.com/wiki/index.php/Image:2024_amc12A_p10.PNG)
## Solution 9 (Complex Number)
Define $Z_{A} = 4 + 3i=5e^{iA}$

and $Z_{B} = 24 + 7i=25e^{iB}$

Looking at the answer choices, we start by testing out an easier choice, such as C.

 (4+$3i)^2$

$$= 16 + 9 \cdot i^2 + 2\cdot12 \cdot i$$

$$= 16 - 9 + 24i$$

$$= 7 + 24i$$

Finally:
$$25^2 \cdot e^{i(2A+B)}$$

$$= 25e^{i2A} \cdot 25e^{iB}$$

$$={(5e^{iA})}^2 \cdot 25e^{iB}$$

$$= (7+24i)(24+7i)$$

$$=25^2i$$

$$=25^2 e^{i\frac{\pi}{2}}$$

This proves that $\angle 2A+ \angle B = \frac{\pi}{2}. ($Given that $\angle A < \frac{\pi}{2}$ and $\angle B < \frac{\pi}{2})$

Therefore $\beta=\boxed{(C) \frac{\pi}{2} -2\alpha}$

~[https://artofproblemsolving.com/wiki/index.php/User:Cyantist luckuso]
## Solution 10 (Double Angle + Co-function Identity)
$\cos(\alpha) = \frac{4}{5} \quad \text{and} \quad \sin(\alpha) = \frac{3}{5}$

Use a double angle identity to calculate $\cos(2\alpha)$:


$$\cos(2\alpha) = \cos^2(\alpha) - \sin^2(\alpha) = \left(\frac{4}{5}\right)^2 - \left(\frac{3}{5}\right)^2 = \frac{16}{25} - \frac{9}{25} = \frac{7}{25}$$


We know that:

$$\sin(\beta) = \frac{7}{25}$$

Equate both to each other:

$$\cos(2\alpha) = \sin(\beta)$$

Apply the co-function identity, $\cos(2\alpha) = \sin\left(\frac{\pi}{2} - 2\alpha\right)$:

$$\sin\left(\frac{\pi}{2} - 2\alpha\right) = \sin(\beta)$$

Hence,

$$\beta=\boxed{(\mathbf{C}) \frac{\pi}{2} - 2\alpha}$$

*~sourodeepdeb*
## Solution 11 (don't do this)

$$
\frac{3}{5} \approx \alpha-\frac{\alpha^{3}}{6}
-5\alpha^3+30\alpha-18 \approx 0
\alpha \approx 0.64464
\frac{7}{25} \approx \beta-\frac{\beta^{3}}{6}
-25\beta^3+150\beta-42 \approx 0
\beta \approx 0.28381
\frac{\pi}{2} - 2 \cdot 0.64464 \approx 0.28151632679 \approx \beta
\beta=\boxed{(\mathbf{C}) \frac{\pi}{2} - 2\alpha}
$$

## Solution 12

$$
\frac{4}{5} \approx 1-\frac{\alpha^2}{2}
5\alpha^2 \approx 2
\alpha \approx \sqrt{\frac{2}{5}} \approx 0.63246
\frac{24}{25} \approx 1-\frac{\beta^2}{2}
25\beta^2 \approx 2
\beta \approx \sqrt{\frac{2}{25}} \approx 0.28284
\frac{\pi}{2} - 2 \cdot 0.63246 \approx 0.30587632679 \approx \beta
\beta=\boxed{(\mathbf{C}) \frac{\pi}{2} - 2\alpha}
$$

## Video Solution (🚀 2 min solve 🚀)
https://youtu.be/7UPO4bF5VoI

_~Education, the Study of Everything_
## See also
