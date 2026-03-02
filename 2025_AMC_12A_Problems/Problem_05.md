# 2025 AMC 12A Problem 5

> This problem is the same as [2025 AMC 10A #13](https://artofproblemsolving.com/wiki/index.php/2025_AMC_10A_Problems/Problem_13) and [2025 AMC 12A #5](https://artofproblemsolving.com/wiki/index.php/2025_AMC_12A_Problems/Problem_5).
## Problem
In the figure below, the outside square contains infinitely many squares, each of them with the same center and sides parallel to the outside square. The ratio of the side length of a square to the side length of the next inner square is k, where 0 < k < 1. The spaces between squares are alternately shaded, as shown in the figure (which is not necessarily drawn to scale).


> [Asymptote diagram - not rendered in Markdown]

```asy
unitsize(1cm); int $n = 25$; real $s = 6$; real ratio = 0.767; real a = s; for (int $i = 0$; i < n; ++i) { real b = a * ratio; // Draw current square draw(box((-a/2,-a/2),(a/2,a/2))); if (i % 2 == 1) { fill(box((-a/2,-a/2),(a/2,a/2)), gray(1)); } else { fill(box((-a/2,-a/2),(a/2,a/2)), lightred); } a = b; } draw(box((-a/2,-a/2),(a/2,a/2)));
```


The area of the shaded portion of the figure is 64\% of the area of the original square. What is k?

$\textbf{(A) } \frac 35 \qquad \textbf{(B) } \frac {16}{25} \qquad \textbf{(C) } \frac 23 \qquad \textbf{(D) } \frac 34 \qquad \textbf{(E) } \frac 45$
## Video Solution
https://youtu.be/CCYoHk2Af34
## Solution 1
Let the side length of the largest square be a, so it has area a^2. Hence, the second-largest square has area $a^2k^2$, the third-largest has $a^2k^4$, and so on.

It follows that the total shaded area is $a^2-a^2k^2+a^2k^4-a^2k^6+...=a^2(1-k^2+k^4-k^6+...)=a^2\dfrac{1}{1+k^2}.$

The ratio of the area of the shaded region to that of the original square is then $\dfrac{a^2\frac{1}{1+k^2}}{a^2}=\dfrac{1}{1+k^2}=\dfrac{64}{100}$

$$\implies 64+64k^2=100\implies k^2=\dfrac{36}{64}\implies k=\boxed{\text{(D) }\dfrac{3}{4}}.$$


*~Tacos_are_yummy_1*
### Remark
We can just let $a=1$ because the question deals with ratios, meaning that there wouldn't be a loss of generality if we let the side length equal some value, getting the same answer $\boxed{D}.$ This was done in solution 3.

*~vgarg (minor clarifications by ~Logibyte)*
## Solution 2
Let the side length of the first square be a and the second square be b. The area of the original square is $a^2.$ The area of the outermost shaded region is $a^2 - b^2.$ Let $\frac{a}{b} =$ r. We have b = $\frac{a}{r}.$ So the outermost shaded region area becomes:

$$a^2 - b^2 = a^2 - \frac{a^2}{r^2}$$

Now let the next square's side lengths be c and d. Similarly, c = $\frac{b}{r} = \frac{a}{r^2}$ and d = $\frac{c}{r} = \frac{a}{r^3}$and the area of the next shaded region becomes:
$$c^2 - d^2 = \frac{a^2}{r^4} - \frac{a^2}{r^6}$$

Notice the pattern of adding 4 to the exponent. If this sequence continues infinitely, we ultimately get:


$$(a^2 + \frac{a^2}{r^4} + \frac{a^2}{r^8} + ...) - (\frac{a^2}{r^2} + \frac{a^2}{r^6} + ...)$$


Which can be simplified using the infinite geometric sequence formula. The problem also tells us that all of this equals 64\% $a^2,$ or $\frac{16}{25}a^2$:


$$\frac{a^2}{1 - \frac{1}{r^4}} - \frac{\frac{a^2}{r^2}}{1 - \frac{1}{r^4}} = \frac{16}{25}a^2$$


$$\frac{1}{1 - \frac{1}{r^4}} - \frac{\frac{1}{r^2}}{1 - \frac{1}{r^4}} = \frac{16}{25}$$


$$r^2 = \frac{16}{9} \implies r = \frac{4}{3}$$
Since the problem tells us the ratio must be less than one, we take the reciprocal to finally get  k = $\frac{1}{r} = \boxed{\text{(D) }\dfrac{3}{4}}.$

*~grogg007*
## Solution 3 (Faster)
Let the outside square be of side length 1, and let p = k^2. Then the area of the square is 1-p+$p^{2}-p^{3}+p^{4}-p^{5}\dots$ or $\left(1-p\right)\left(1+p^{2}+p^{4}+p^{6}+\dots\right).$ Then, using geometric series, we get $\left(1-p\right)\left(\frac{1}{1-p^{2}}\right) = \frac{1}{1+p}.$ This is equal to $\frac{64}{100}.$ Therefore, $1+p=\frac{25}{16},$ so $p = 9/16$ and $k =\frac{3}{4}.$ Therefore, the answer is $\boxed{(D)\frac{3}{4}}.$

*~Moonwatcher22*
(Minor LaTeX edits by ~roblmin235)
## Solution 4 (The fastest, no sequences/series)
Since this is an infinite fixed pattern, we can actually take a huge shortcut. Suppose we take off the outer "layer" and then swap the colors. We have essentially created a smaller copy of the original diagram, specifically with a k:1 ratio of side lengths. Assume the original diagram had 100 units of area. Then, based on the givens, the original diagram had 64 units of shaded area and 36 units of unshaded area, meaning our new smaller diagram has 36 units of shaded area. Since the ratio of corresponding side lengths between our new diagram and the original diagram is k, the ratio of corresponding areas is k^2. Thus, we get $k^2 =\frac{36}{64},$ so k = $\boxed{\text{(D) }\dfrac{3}{4}}.$

Note: the explanation seems complicated to explain, but the thought process while doing it is extremely fast, much faster than any of the methods involving a series.

*~dg6665*

~remark: At least personally, the final $k^2 =\frac{36}{64}$ seemed to have a nonobvious origin, so here as an explanation of it. In the original figure, the nonshaded part makes up 36/100 units. In the new diagram, the nonshaded part makes up 64/100 units, but since this new diagram has area $k^2,$ the nonshaded part has area $\frac{64k^2}{100}$ setting these two equal gives $k^2 =\frac{36}{64}$
*~Neber100*
## Solution 5 (based very closely on solution 4)
Similarly to solution 4, we can imagine "peeling" off the outer layer to get an inner figure that is similar to the outer figure. Letting the large square have side 1, we know the outer shaded layer has area $1-k^2.$ The shaded part of the inner figure (with the outer shaded part removed now must make up $\frac{36}{100} = \frac{9}{25}$ of the inner area of k^2. Together, the inner shaded part and the outer shaded part must add up to $\frac{64}{100},$ as they make up 64% of the square. Thus, we get the equation
$$1-k^2 + \frac{9k}{25} = 16/25$$
- Solving this gives $k = 3/4$
*~Neber100*
## Solution 6 (The longest way)
Notes that: The sum S can be written as:

$$
\begin{align*} S &= 1^2 - k^2 + (k^2)^2 - (k^3)^2 + (k^4)^2 - (k^5)^2 + (k^6)^2 - \dots \\ &= k^0 - k^2 + k^4 - k^6 + k^8 - k^{10} + \dots \\ &= (k^0 + k^4 + k^8 + k^{12} + \dots) - (k^2 + k^6 + k^{10} + k^{14} + \dots) \\ \end{align*}
$$

So we have:

$$
\begin{align*} S &= \lim_{n\rightarrow\infty}\left[1\times\dfrac{1-(k^4)^n}{1-k^4}-k^2\times\dfrac{1-(k^4)^n}{1-k^4}\right]\\ &= \dfrac{1}{1-k^4}-\dfrac{k^2}{1-k^4} \\ &= \dfrac{1-k^2}{1-k^4} \\ &= \dfrac{1-k^2}{(1+k^2)(1-k^2)} \\ &= \dfrac{1}{1+k^2} \end{align*}
$$

We are given the condition that:
$$\because \dfrac{1}{1+k^2}=64\%=\dfrac{64}{100}=\dfrac{16}{25}$$
We can now solve for k:

$$
\begin{align*} \therefore \dfrac{1}{1+k^2} &= \dfrac{16}{25} \\ 1+k^2 &= \dfrac{25}{16} \\ k^2 &= \dfrac{25}{16} - 1 \\ k^2 &= \dfrac{25}{16} - \dfrac{16}{16} \\ k^2 &= \dfrac{9}{16} \\ k &= \pm\sqrt{\dfrac{9}{16}} \\ k &= \pm\dfrac{3}{4} \end{align*}
$$

Therefore, ignore the negative value (Because $\color{red}\boxed{\color{black}\dfrac{3}{4}}\color{black}. We are done ~~ : ) ~ funkCCP
## Solution 7
Assume that the side length for the largest square in the diagram is 1. Since the ratio of the next inner square to the largest square is k, we get that the side length for the second largest square is $k, k^2$ for the third largest square, and $k^3$ for the fourth largest square. So, we can write that $(1-k^2)+(k^4-k^6)+...=\frac{64}{100}$ by using the diagram since the area of a square with side length s is s^2. This is a geometric sequence with first term $1-k^2$ and ratio $k^4. So,$ we can sum the geometric series for $\frac{1-k^2}{1-k^4}=\frac{64}{100}.$ Cross multiplying, we have that 100-$100k^2=$64-$64k^4$. Moving the terms to one side, we have $64k^4-$1$00k^2+36=0$, and we can factor as $(64k^2-36)$(k^2-1)=0. Since k<1, $k^2-1=0$ is invalid. So, we have $6$4$k^2-36=0$, and simplifying we get $k^2=\frac{36}{64}.$ Since k>0, $k=\frac{6}{8}=\boxed{\frac{3}{4}}.$ ~ gogogo2022
## Solution 8 (Cheese 🧀)
Measure the side length of the first square to be 2 inches. Measure the side length of the second square to be 1.5 inches. $\frac{1.5}{2} = \frac{3}{4} = \boxed{\text{(D) } \frac{3}{4}}$ ~Aeioujyot ~remark: this is probably a bad idea since MAA could intentionally put a not-to-scale diagram on it. They make it clear diagrams are not necessarily to scale ~dg6665 ~🧀 ~🧀 ~🧀 ~🧀 ~🧀 ~🧀 ~🧀🧀🧀 ~🧀 ~remark-This is REALLY risky, NEVER do this thing on the actual test. Solution 4 is more accurate and logical and explains basically the same idea. - Mathhman645 ~note from Sakura_kitty; even though they say the images are not to scale, they are actually pretty to scale, just not the most exact because they don’t measure the images millimeter to millimeter.
## Solution 9 (Fastest and shortest, similar to solution 4, no series)
Since the figure is self-similar, the nonshaded area is 100\%-64\% = 36\% of the largest square and 64\% of the square with side length k, which has area k^2. Thus 36\% = 64\%$k^2, k^2 =\frac{36}{64},$ so k = $\frac{6}{8} = \boxed{\text{(D) }\dfrac{3}{4}}.$ ~NekawaH ~Coincidentally, this is in fact the exact same thought process as the "remark" posted in solution 4 by ~Neber100.
## Solution 10 (Series Subtraction)
Assume initial length 1 since the problem just uses ratios. We see that each side length shrinks by factor k, then they are squared to get the areas, which really just multiplies their exponents by 2. We add our shaded areas and subtract our un-shaded areas, yielding the alternating series 1 - $k^{2}+k^{4}-k^{6}$... We express this as two infinite series, one being subtracted from the other $\sum_{n=0}^{\infty}k^{4n}-\sum_{n=0}^{\infty}k^{4n+2}$  Rewrite using the infinite geometric series formula and simplify as far as possible $\frac{1}{1-k^{4}} - \frac{k^{2}}{1-k^{4}}\frac{1-k^{2}}{1-k^{4}}\frac{1-k^{2}}{(1+k^{2})(1-k^{2})}\frac{1}{1+k^{2}}$ We know this is equal to $\frac{64}{100} = \frac{16}{25}\frac{1}{1+k^{2}} = \frac{16}{25}16k^{2}+16 =25 16k^{2} = 9 k^{2}=\frac{9}{16}$ We must only consider the positive root $k=\boxed{\text{(D) }\dfrac{3}{4}}.$ ~shockfront99
## Chinese Video Solution
https://www.bilibili.com/video/BV1nhkUByEV4/ ~metrixgo
## Video Solution (Intuitive and Easy)
https://youtu.be/1GzN3-H9BRo ~Education, the Study of Everything
## Video Solution by Power Solve
https://www.youtube.com/watch?v=Vd_kvodRjNQ
## Video Solution (In 1 Min)
https://youtu.be/5H8L7_M9BWc?si=ZDOYb3ZKllXsWFyn ~ Pi Academy
## Video Solution by SpreadTheMathLove
https://www.youtube.com/watch?v=dAeyV60Hu5c
## Video Solution
https://youtu.be/gWSZeCKrOfU ~MK
## Video Solution by Daily Dose of Math
https://youtu.be/5Fjos1vBt0A ~Thesmartgreekmathdude
## Video Solution by Thinking Feet
https://youtu.be/zcnN2m_jKLo
## Video Solution by DARSHSHETTY4
https://www.youtube.com/watch?v=EavPSr8bOx8
## See Also
