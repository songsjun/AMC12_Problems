# 2023 AMC 12A Problem 9

> This problem is the same as [2023 AMC 10A #11](https://artofproblemsolving.com/wiki/index.php/2023_AMC_10A_Problems/Problem_11) and [2023 AMC 12A #9](https://artofproblemsolving.com/wiki/index.php/2023_AMC_12A_Problems/Problem_9).
## Problem
A square of area 2 is inscribed in a square of area 3, creating four congruent triangles, as shown below. What is the ratio of the shorter leg to the longer leg in the shaded right triangle?

> [Asymptote diagram - not rendered in Markdown]

```asy
size(200); defaultpen(linewidth(0.6pt)+fontsize(10pt)); real y = sqrt(3); pair A,B,C,D,E,F,G,H; A = (0,0); B = (0,y); C = (y,y); D = (y,0); E = ((y + 1)/2,y); F = (y, (y - 1)/2); G = ((y - 1)/2, 0); H = (0,(y + 1)/2); fill(H--B--E--cycle, gray); draw(A--B--C--D--cycle); draw(E--F--G--H--cycle);
```


$\textbf{(A) }\frac15\qquad\textbf{(B) }\frac14\qquad\textbf{(C) }2-\sqrt3\qquad\textbf{(D) }\sqrt3-\sqrt2\qquad\textbf{(E) }\sqrt2-1$
## Solution 1
The side lengths of the inner square and outer square are $\sqrt{2}$ and $\sqrt{3}$ respectively. Let the shorter side of our triangle be x, thus the longer leg is $\sqrt{3}-x.$
Hence, by the Pythagorean Theorem, we have

$$
\begin{align*} (\sqrt{3}-x)^2+x^2&=(\sqrt{2})^2 \\ 3-2\sqrt{3}x+x^2+x^2&=2 \\ 2x^2-2\sqrt{3}x+1&=0. \end{align*}
$$

By the quadratic formula, we find that $x=\frac{\sqrt{3}\pm1}{2},$ so the answer is $\frac{\sqrt{3}-1}{\sqrt{3}+1}=\boxed{\textbf{(C) }2-\sqrt3}.$

*~semisteve*
*~SirAppel*
*~ItsMeNoobieboy*
## Solution 2 (Area)
Looking at the diagram, we know that the square inscribed in the square with area 3 has area 2. Thus, the area outside of the small square is $3-2=1$. This area is composed of 4 congruent triangles, so we know that each triangle has an area of $\dfrac14.$

From solution 1, the base (short side of the triangle) has a length x and the height $\sqrt{3} -$ x, which means that $\frac{x\left(\sqrt{3} - x\right)}{2} = \frac{1}{4}.$

We can turn this into a quadratic equation: $x^2-x\sqrt{3}+\frac{1}{2} = 0.$

By using the quadratic formula, we get $x=\frac{\sqrt{3}\pm1}{2}.$Therefore, the answer is $\frac{\sqrt{3}-1}{\sqrt{3}+1}=\boxed{\textbf{(C) }2-\sqrt3}.$

*~ghfhgvghj10 (If I made any mistakes, feel free to make minor edits)*

(Clarity & formatting edits by Technodoggo)
## Solution 3
Let x be the ratio of the shorter leg to the longer leg, and y be the length of longer leg. The length of the shorter leg will be xy.

Because the sum of two legs is the side length of the outside square, we have xy + $y =\sqrt{3},$ which means (xy)^2 + y^2 + 2xy^2 = 3. Using the Pythagorean Theorem for the shaded right triangle, we also have (xy)^2 + y^2 = 2. Solving both equations, we get 2xy^2 = 1. Using $y^2=\frac{1}{2x}$ to substitute y in the second equation, we get $x^2\cdot \frac{1}{2x} + \frac{1}{2x} = 2.$ Hence, x^2 - $4x + 1 = 0$. By using the quadratic formula, we get $x=2\pm \sqrt3.$ Because x be the ratio of the shorter leg to the longer leg, it is always less than 1. Therefore, the answer is $\boxed{\textbf{(C) }2-\sqrt3}.$

*~sqroot*
## Solution 4
The side length of the bigger square is equal to $\sqrt{3},$ while the side length of the smaller square is $\sqrt{2}.$ Let x be the shorter leg and y be the longer one. Clearly, $x+y=\sqrt{3},$ and $xy=\frac{1}{2}.$ Using Vieta's to build a quadratic, we get $x^2-\sqrt{3}x+\frac{1}{2}=0.$ Solving, we get $x=\frac{\sqrt{3}-1}{2}$ and $y=\frac{\sqrt{3}+1}{2}.$ Thus,  we find $\frac{x}{y}=\frac{\sqrt{3}-1}{\sqrt{3}+1}=\frac{(\sqrt{3}-1)^2}{(\sqrt{3}+1)\cdot(\sqrt{3}-1)}=\frac{4-2\sqrt{3}}{2}=\boxed{\textbf{(C) }2-\sqrt3}.$

*~vadava_lx*
## Solution 5
Let $\theta$ be the angle opposite the smaller leg. We want to find $\tan\theta.$

The area of the triangle is $\frac{1}{2}\left(\sqrt{2}\sin\theta\right)\left(\sqrt{2}\cos\theta\right)=\frac{1}{2}\sin 2\theta=\frac{1}{4},$ which implies $\sin 2\theta = \frac{1}{2},$ or $\theta=15^\circ.$ Therefore $\tan \theta = \boxed{\textbf{(C) }2-\sqrt3}$
## Solution 6
Allow a and b to be the sides of a triangle. WLOG, suppose a > b. We want to find $\frac{b}{a}.$ Notice that the area of a triangle is $\frac{3-2}{4},$ which results in $\frac{1}{4}.$ Thus, $ab =\frac{1}{2}.$ However, the square of the hypotenuse of this triangle is $a^2+b^2,$ but also 2. We can write b as $\frac{1}{2a},$ and then plug it in. We get $a^2+\frac{1}{4a^2} = 2,$ so $4a^4-$8$a^2+1 = 0$. Applying the quadratic formula, $a^2 =\frac{8 \pm 4\sqrt{3}}{2},$ or 4 $\pm 2\sqrt3.$ However, since a and b must both be solutions of the quadratic, since both equations were cyclic. Since a>b, then $a^2 =4+2\sqrt3,$ and $b^2 =4-2\sqrt3.$ To find $\frac{b}{a},$ we can simply find the square root of $\frac{b^2}{a^2}.$ This is $\sqrt{\frac{4-2\sqrt3}{4+2\sqrt3}} = \sqrt{\frac{2-\sqrt3}{2+\sqrt3}} = \sqrt{(2-\sqrt3)(2-\sqrt3)} = \boxed$ {$2-\sqrt3$}, so the answer is $\boxed$ {C}. - Sepehr2010
## Solution 7 (Manipulation)
Let a be the length of the shorter leg and b be the longer leg. By the Pythagorean theorem, we can derive that a^2+b^2=2. Using area we can also derive that $2ab=1. (a+b)^2=3$ as given in the diagram, we can find that $(a-b)^2=1$ because 4ab=2. This means that $b+a=\sqrt{3}$ and b-$a=1$. Adding the equations gives $b=\frac{\sqrt{3}+1}{2}$ and when b is plugged in $a =\frac{\sqrt{3}-1}{2}.$ Rationalizing the denominators gives us $\boxed{\textbf{(C) } 2-\sqrt{3}}.$
## Solution 8
Let s be the length of the shorter leg, l the longer leg, and t the desired ratio. We have:
$s^2+l^2=$2 $\text{ and } \frac{1}{2}$sl=$\frac{1}{4}$
The former dividing the latter gives:
$$t+\frac{1}{t}=4$$
Solve this for t.
Multiply by t:
$$t^2+1=4t$$
Subtract -$4t$ to get a quadratic:
$t^2-4t+1=0$ Use the quadratic formula to get:
$$2 \pm \sqrt{3}$$
And since the smaller one is the first one, the solution has to be less than 1, so the answer is the one less than 1, the answer is
$$\boxed{\textbf{(C) }2-\sqrt3}$$

*~yinglinwu*
~ .dll
## Video Solution by Little Fermat
https://youtu.be/h2Pf2hvF1wE?si=jPmOlhD8haZA8-hK&t=2309
*~little-fermat*
## Video Solution by Math-X (First understand the problem!!!)
https://youtu.be/GP-DYudh5qU?si=H7rtzYDnG-hbDpIQ&t=2706

*~Math-X*
## Video Solution by Power Solve (easy to digest!)
https://www.youtube.com/watch?v=7KXT1pI-i64
## Video Solution (🐉⚡Under 5 min⚡🐉)
https://youtu.be/OiBUPU1bULc

*~Education, the Study of Everything*
## Video Solution by CosineMethod [🔥Fast and Easy🔥]
https://www.youtube.com/watch?v=IVgzVS86Ogo
## Video Solution
https://youtu.be/jL2k7MFgfzQ

*~Steven Chen (Professor Chen Education Palace, www.professorchenedu.com)*
## See Also
