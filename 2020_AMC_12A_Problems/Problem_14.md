# 2020 AMC 12A Problem 14

## Problem
Regular octagon ABCDEFGH has area n. Let m be the area of quadrilateral ACEG. What is $\tfrac{m}{n}$?

$\textbf{(A) } \frac{\sqrt{2}}{4} \qquad \textbf{(B) } \frac{\sqrt{2}}{2} \qquad \textbf{(C) } \frac{3}{4} \qquad \textbf{(D) } \frac{3\sqrt{2}}{5} \qquad \textbf{(E) } \frac{2\sqrt{2}}{3}$
## Solution 1
ACEG is a square. WLOG AB = 1, then using Law of Cosines, AC^2 = [ACEG] $= 1^2 + 1^2 - 2 \cos{135} = 2 + \sqrt{2}.$ The area of the octagon is just [ACEG] plus the area of the four congruent (by symmetry) isosceles triangles, all an angle of 135 in between two sides of length 1. Now, $\dfrac{m}{n} = \dfrac{2 + \sqrt{2}}{2 + \sqrt{2} + 4 \cdot \tfrac{1}{2} \sin{135}} = \dfrac{2 + \sqrt{2}}{2 + 2 \sqrt{2}} = \dfrac{\sqrt{2}}{2}.$ The answer is $\boxed{\textbf{(B)}}.$
## Solution 2
Refer to the diagram. Call one of the side lengths of the square s. Since quadrilateral ACEG is a square, the area of the square would just be $s^2,$ which we can find by applying Law of Cosines on one of the four triangles. Assume each of the sides of the octagon has length 1. Since each angle measures $135^{\circ}$ in an octagon, then $s^2 =1^2+1^2-2\cos(135^{\circ}) = 2+\sqrt{2}$

There are many ways to find the area of the octagon, but one way is to split the octagon into two trapezoids and one rectangle. We can easily compute AF to be $1+\sqrt{2}$ from splitting one of the sides into two 45-45-90 triangles. So the area of the octagon is $2\cdot\frac{1+\sqrt{2}}{2}+1+\sqrt{2} \Rightarrow 2+2\sqrt{2}.$

Hence, $\frac{m}{n} = \frac{2+\sqrt{2}}{2+2\sqrt{2}}$

$$
\Rightarrow \frac{2+\sqrt{2}}{2+2\sqrt{2}} \cdot \frac{2-2\sqrt{2}}{2-2\sqrt{2}}
\Rightarrow \frac{-2\sqrt{2}}{-4}
\Rightarrow \boxed{\textbf{(B)}\frac{\sqrt{2}}{2}}
$$


*~Solution by IronicNinja ~Edited by sl_hc*
## Solution 3 (Deriving Formulas)
> [Asymptote diagram - not rendered in Markdown]

```asy
draw((1, 2.41421356)--(2.41421356, 1)--(2.41421356, -1)--(1, -2.41421356)--(-1, -2.41421356)--(-2.41421356, -1)--(-2.41421356, 1)--(-1, 2.41421356)--cycle); draw((2.41421356, 1)--(1, -2.41421356)--(-2.41421356, -1)--(-1, 2.41421356)--cycle); label("A",(-1, 2.41421356),NW); label("B",(1, 2.41421356),NE); label("C",(2.41421356, 1),NE); label("D",(2.41421356, -1),SE); label("E",(1,-2.41421356),SE); label("F",(-1,-2.41421356),SW); label("G",(-2.41421356,-1),SW); label("H",(-2.41421356,1),NW);
```


The first thing to notice is that ACEG is a square. This is because, as \bigtriangleup ABC \cong \bigtriangleup CDE \cong \bigtriangleup EFG \cong \bigtriangleup GHE, they all have the same base, meaning that AC = DE = EG = GA. Hence, we have that it is a square. To determine the area of this square, we can determine the length of its diagonals.

In order to do this, we first determine the area of the octagon. Letting the side length be a, we can create a square of length s around it (see figure).

> [Asymptote diagram - not rendered in Markdown]

```asy
draw((1, 2.41421356)--(2.41421356, 1)--(2.41421356, -1)--(1, -2.41421356)--(-1, -2.41421356)--(-2.41421356, -1)--(-2.41421356, 1)--(-1, 2.41421356)--cycle); label("a",(1, 2.41421356)--(2.41421356, 1),S); draw((-2.41421356, 2.41421356)--(2.41421356, 2.41421356)--(2.41421356, -2.41421356)--(-2.41421356, -2.41421356)--cycle); label("s",(-2.41421356, 2.41421356)--(2.41421356, 2.41421356),N);
```


Creating a small square of side length a from the corners of this figure gives us an area of a^2. Thus, s^2 - a^2 = n where n is the area of the octagon. We know from the Pythagorean Theorem that s = a + $\frac{a}{\sqrt{2}},$ meaning that n = (a + $\frac{a}{\sqrt{2}})^2 -a^2 =2a^2($1+\sqrt{2})$.$

Dividing this by 8 gives us the area of each triangular segment which makes up the octagon. Further dividing by 2 gives us the area of a smaller segment consisting of the right triangle with legs of the apothem and $\frac{a}{2}.$ Using the area of a triangle as $\frac{1}{2}$bh, we can determine the length of apothem r from


$$
\frac{2a^2(1+\sqrt{2})}{8 \times 2} = \frac{\frac{a}{2}\times r}{2}
\frac{4a^2(1+\sqrt{2})}{8 } = ar
\frac{a(1+\sqrt{2})}{2} = r.
$$


From the apothem, we can once again use the Pythagorean Theorem, giving us the length of the circumradius R.


$$
R^2 = (\frac{a(1+\sqrt{2})}{2})^2 + (\frac{a}{2})^2
R^2 = \frac{a^2(1+\sqrt{2})^2}{4} + \frac{a^2}{4}
R^2 = \frac{a^2(3+2\sqrt{2})}{4} + \frac{a^2}{4}
R^2 = \frac{a^2(4+2\sqrt{2})}{4}
R = \sqrt{\frac{a^2(4+2\sqrt{2})}{4}} = \frac{a\sqrt{4 + 2\sqrt2}}{2}.
$$


Doubling this gives us the diagonal of both the square and the octagon. From here, we can use the formula A = $\frac{1}{2}d^2$ for the area of the square:


$$
A = \frac{(a\sqrt{4 + 2\sqrt2})^2}{2}
A = \frac{a^2(4+2\sqrt{2})}{2} = m.
$$


Thus we now only need to find the ratio $\frac{m}{n}.$ This can be easily done through some algebra:


$$
\frac{m}{n} = \frac{a^2(4+2\sqrt{2})}{2(2a^2(1+\sqrt{2})}
\frac{m}{n} = \frac{4+2\sqrt{2}}{4+4\sqrt{2}}
\frac{m}{n} = \frac{2+\sqrt{2}}{2+2\sqrt{2}}
$$


Rationalizing the denominator by multiplying by the conjugate, we get $\frac{m}{n} = \boxed{\textbf{(B) } \frac{\sqrt{2}}{2}}.$ ~ciceronii

*$\textbf{Note:}$ this can more easily be done if you know any of these formulas. This was an entire derivation of the area of an octagon, it's apothem, and it's circumradius, but it can be much simpler if you have any of these memorized.

*$\textbf{Note No.2:}$ The formula [ABCDEFG]=($\sqrt{2})$[ACEG] is one from the Intro to Geometry Textbook: Problem 16.46.
*~Note No.2 by athreyay*
## Solution 3 (Elementary Geometry)
WLOG, let AE=1. Let the intersection of AF and GD be point I. GIF is an isosceles right triangle ($m\angle HGF=135^{\circ}),$ so IG=IF=$\frac{1}{\sqrt{2}}.$ The distance between each side and the center is then IF+$\frac{1}{2}GH=\frac{1}{2}+\frac{1}{\sqrt{2}}.$ ABCDEFGH is 8 triangles of base 1 and altitude $\frac{1}{2}+\frac{1}{\sqrt{2}},$ so its area is $8($\frac{1}{2})(\frac{1}{2}+\frac{1}{\sqrt{2}})$$ or
$$2+2\sqrt{2}$$
Similarly, ACEG is clearly a  square of area $GA^2.$ By the Pythagorean Theorem, GA^2=GI^2+IA^2=($\frac{1}{\sqrt{2}})^2+(1+\frac{1}{\sqrt{2}})^2$ or

$$
2+\sqrt{2}
\frac{m}{n} = \frac{2+\sqrt{2}}{2+2\sqrt{2}}
$$

From some fast manipulations, see that it is $\boxed{\textbf{B)}\frac{\sqrt{2}}}$

~~BJHHar
## Solution 4 (Quick n' Easy)
This solution is quite efficient and unconvoluted. Though the explanation appears long, this is only because I have tried to make it very thorough.

Because we are finding the ratios of the areas of the quadrilateral, and the octagon, let us assume, for simplicity's sake, that the octagon has side length 1. Call O the center of the octagon. Because it is a regular octagon, $\angle AOB$ is $\frac{360}{8}=45.$
Draw the apothem, and call where it intersects AB, I. As the apothem bisects $\angle AOB, \angle AIB$ is $\frac{45}{2}=22.5.$
Then, as the apothem is perpendicular to AB, $\angle IBO$ is 90-22.5=67.5. As the apothem bisects AB, segment IB is $\frac{1}{2}.$ Thus, the apothem has length $\frac{1}{2} \cdot \text{tan}(67.5).$ By the formula $\text{area} = \text{apothem} \cdot \frac{\text{perimeter}}{2},$ the area of the octagon is then $\frac{1}{2} \cdot \text{tan}(67.5) \cdot \frac{8}{2}.$

Now, we move on to the quadrilateral. Let us take triangle AGH. By the interior angle formula, m $\angle AGH = \frac{180 (8-2)}{8} = 135.$ Because the octagon is regular, AGH is isosceles, with assumed sidelength 1. Drop an altitude from H to AG, and call the intersection point, P. As AGH is isosceles, this altitude bisects both segment AG and angle AHG. Thus, the m $\angle AHP = \frac{135}{2} = 67.5.$ Let us call the length of AG, which is also a side of the quadrilateral, s. Then, AP is $\frac{s}{2}.$ Thus, $\text{sin}(67.5) = \frac{\frac{s}{2}}{1},$ so $s = 2\cdot \text{sin}(67.5).$ We can do the same for each of the other sides of the quadrilateral and find that they are of the same length. One can easily see that triangle ABC is congruent to triangle AGH. Because triangle AGH is isosceles, m $\angle HAG = \frac{180-135}{2} = 22.5.$ The same can be said of angles BAC. Thus, angle CAG, an interior angle of the quadrilateral is 90. We can do the same for the other interior angles of CEGA and find that they are also 90. Thus, CEGA is a square, so its area is $s^2 = $4 $\cdot \text{sin}^2(67.5).$

Now, we must find the ratios of the two areas.
$\frac{\text{Area(quadrilateral)}}{\text{Area(hexagon)}} = 4 \cdot \frac{\text{sin}^2(67.5)}{2\cdot \text{tan}(67.5)} =f$rac{$2\cdot \text{sin}^2(67.5)$}{$\frac{\text{sin}(67.5)}{\text{cos}(67.5)}$} = $2\cdot \text{sin}(67.5) \cdot \text{cos}(67.5) = \text{sin} (135) = \frac{\sqrt{2}}{2},$ the answer.

*~jyatvitskiy :)*
## Solution 5 (Simplest)
> [Asymptote diagram - not rendered in Markdown]

```asy
draw((1, 2.41421356)--(2.41421356, 1)--(2.41421356, -1)--(1, -2.41421356)--(-1, -2.41421356)--(-2.41421356, -1)--(-2.41421356, 1)--(-1, 2.41421356)--cycle); draw((2.41421356, 1)--(1, -2.41421356)--(-2.41421356, -1)--(-1, 2.41421356)--cycle); draw((-1, 2.41421356)--(1,-2.41421356)); draw((1, 2.41421356)--(-1,-2.41421356)); draw((2.41421356, 1)--(-2.41421356,-1)); draw((2.41421356, -1)--(-2.41421356,1)); label("A",(-1, 2.41421356),NW); label("B",(1, 2.41421356),NE); label("C",(2.41421356, 1),NE); label("D",(2.41421356, -1),SE); label("E",(1,-2.41421356),SE); label("F",(-1,-2.41421356),SW); label("G",(-2.41421356,-1),SW); label("H",(-2.41421356,1),NW); label("O",(.1,.1),NE); label("P",(.60710678,1.60710678),SE);
```


The ratio $\frac{m}{n}=\frac{[OPC]}{[OBC]}=\frac{OP}{OB}=\frac{OP}{OC}=\frac{\sqrt {2}}{2}.$

<>
## Solution 6 (Law of Sines, similar to Solution 5)
Let O be the center of the octagon. Let AO with HB intersect at X. By symmetry, the problem reduces to finding the ratio between the area of the triangle ABO and OXB, which is equal to $\frac{\frac{1}{2}XO\cdot BO \sin{\theta}}{\frac{1}{2}AO \cdot BO \sin{\theta}} = \frac{XO}{AO} = \frac{XO}{BO} = \boxed{\frac{\sqrt{2}}{2}}.$ Here, $\theta$ represents the angle AOB.
## Video Solution by OmegaLearn (Using Law of Cosines)
https://youtu.be/4_x1sgcQCp4?t=5605 ~ pi_is_3.14
## See Also
