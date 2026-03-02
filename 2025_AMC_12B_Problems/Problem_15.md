# 2025 AMC 12B Problem 15

> This problem is the same as [2025 AMC 10B #19](https://artofproblemsolving.com/wiki/index.php/2025_AMC_10B_Problems/Problem_19) and [2025 AMC 12B #15](https://artofproblemsolving.com/wiki/index.php/2025_AMC_12B_Problems/Problem_15).
## Problem
A container has a $1\times 1$ square bottom, a $3\times 3$ open square top, and four congruent trapezoidal sides, as shown. Starting when the container is empty, a hose that runs water at a constant rate takes 35 minutes to fill the container up to the midline of the trapezoids.


> [Asymptote diagram - not rendered in Markdown]

```asy
/* Made by Mathemagician108 */ import graph3; size(200); real $a = 1$; real $d = 0.6$; real $h = 0.9$; triple A1 = (a,0,0); triple B1 = (0,a,0); triple C1 = (-a,0,0); triple D1 = (0,-a,0); triple A2 = (a+d,0,h); triple B2 = (0,a+d,h); triple C2 = (-(a+d),0,h); triple D2 = (0,-(a+d),h); triple A3 = ($a+2$*d,0,2*h); triple B3 = (0,$a+2$*d,2*h); triple C3 = (-($a+2$*d),0,2*h); triple D3 = (0,-($a+2$*d),2*h); path3 bottom = A1--B1--C1--D1--cycle; path3 backright = A1--B1--B2--A2--cycle; path3 backleft = B1--C1--C2--B2--cycle; path3 frontleft = C1--D1--D3--C3--cycle; path3 frontright = D1--A1--A3--D3--cycle; defaultpen(1); pen blue = rgb(202, 201, 255); pen red = rgb(255, 164, 164); // colored surfaces draw(surface(bottom), emissive(gray)); draw(surface(backright), emissive(blue)); draw(surface(backleft), emissive(blue)); draw(surface(frontleft), emissive(red)); draw(surface(frontright), emissive(red)); // black outlines draw(A1--D1--C1); draw(A2--D2--C2); draw(A3--D3--C3, linewidth(1.4)); draw((0.32,0.68,0)--B1--(-0.32,0.68,0)); draw((1.25,0.35,h)--B2--(-1.25,0.35,h)); draw(A3--B3--C3); draw(A1--A3); draw(B1--B3); draw(C1--C3); draw(D1--D3, linewidth(1.4)); currentprojection=perspective((0,-4,3));
```


How many more minutes will it take to fill the remainder of the container?


$$\text{(A) }70 \qquad \text{(B) }85 \qquad \text{(C) }90 \qquad \text{(D) }95 \qquad \text{(E) }105$$

## Solution 1
Extend the edges pointing downwards to converge at a point A to form a square pyramid. Consider 3 square pyramids, the large one formed by the top vertices of the original figure and A, the middle one formed by the medians running through the sides of the original figure and point A, and the smaller one formed by the bottom vertices of the original figure and point A. Note that all pyramids are similar since they are all essentially scaled by a certain factor.

The median length is $\frac{3+1}{2}=2$

Using side length to volume ratios, find that the volumes must have ratios 1:8:27
Then, you get that the ratio of the volume thus filled to the volume that we must fill is equivalent to
8-1:$27-8 = 7$:19.
Thus, it will take
$$\frac{19}{7}$$
more time to fill the remaining volume giving us an answer of
$$\frac{19}{7} * 35 = \boxed{\textbf{(D) }95}$$

*~Failure.net*
## Solution 2 (2 min)
Note that dividing this shape along the midline gives two truncated pyramids with base areas $1$ and $4$, and $4$ and $9$ (a truncated pyramid is a pyramid is cut at some point parallel to the base to reach a shape with bases that are squares). Using the truncated pyramid volume formula

$$V = \frac{1}{3}h\,(A_1 + A_2 + \sqrt{A_1A_2}),$$

we get volumes

$\frac{1}{3}$h(1 + 4 + $\sqrt{4}) \qquad\text{and}\qquad \frac{1}{3}$h(4 + 9 + $\sqrt{36}).$

Writing their ratio, we obtain

$$\frac{13 + 6}{5 + 2} = \frac{19}{7}.$$

Thus,

$$35 \cdot \frac{19}{7} = 95.$$

So the remaining time is $\boxed{95}$.

*~Cyrus825*
## Solution 3 (Calculus)
The volume that was filled in 35 minutes can be represented as $\int_1^2 s^2 \text{d}$s = $\frac{1}{3}\left(2^3 - 1^3\right) = \frac{7}{3}$ where s represents the side length of the horizontal cross-sectional square. Then, the volume that remains to be filled is $\int_2^3 s^2 \text{d}$s = $\frac{1}{3}\left(3^3 - 2^3\right) = \frac{19}{3}.$ Since the filling rate is the same, the amount of time this will take is 35 $\cdot \frac{3}{7} \cdot \frac{19}{3} = \boxed{\textbf{(D) }95}$

*~grape1984*
## Solution 4 (Construction)
Extend the bottom of the container to form an upside down square pyramid. Then take a diagonal cross section as shown below.


> [Asymptote diagram - not rendered in Markdown]

```asy
size(220); // Outer (largest) upside-down isosceles triangle pair A = (0,-4); // bottom vertex pair B = (-3,0); // left base point pair C = (3,0); // right base point draw(A--B--C--cycle); // Middle triangle (scaled toward A) real k2 = 0.6; pair B2 = A + k2*(B - A); pair C2 = A + k2*(C - A); draw(A--B2--C2--cycle); // Smallest triangle (scaled toward A) real k3 = 0.3; pair B3 = A + k3*(B - A); pair C3 = A + k3*(C - A); draw(A--B3--C3--cycle); // --- Heights (altitudes) --- // Outer triangle height pair mid1 = (B + C)/2; draw(mid1--A); label("$x_1$", midpoint(mid1--A)+(0.25,1.25)); // centered on the segment label("$\sqrt{2}$", midpoint(mid1--A)+(3.4,2)); // centered on the segment // Middle triangle height pair mid2 = (B2 + C2)/2; draw(mid2--A); label("$x_2$", midpoint(mid2--A)+(0.25,0.65)); // centered on the segment label("$\sqrt{2}$", midpoint(mid2--A)+(2.3,1.2)); // centered on the segment // Smallest triangle height pair mid3 = (B3 + C3)/2; draw(mid3--A); label("$x_3$", midpoint(mid3--A)+(0.25,0.25)); // centered on the segment label("$\sqrt{2}$", midpoint(mid3--A)+(1.2,0.6)); // centered on the segment
```


You can notice that there are several similar triangles, so we write several equations.

$$
\frac{x_3}{x_1+x_2+x_3}=\frac{\sqrt{2}}{3\sqrt{2}}
\frac{x_3}{x_2+x_3}=\frac{\sqrt{2}}{2\sqrt{2}}
$$


Then solve the system to get: $x_1=x_2=x_3$=x

Write the volumes of the three pyramids with sides of the bases 1,2, and 3 respectively:

$$
V_1=\frac{x}{3}
V_2=\frac{8x}{3}
V_3=9x
$$


The volumes of the part of the container below the midline and above it are.

$V_$2-V_$1=\frac{7x}{3}$ and $V_$3-V_$2=\frac{19x}{3}$

Then the time t for the top to fill up is given by $\frac{\frac{19x}{3}}{\frac{7x}{3}}=\frac{t}{35}$
Therefore  $t=\boxed{\mathbf{(D)}\ 95}$

*~AARONPICK2*
## Video Solution (Fast and Easy)
https://www.youtube.com/watch?v=S5_iQpIN43w

*~Pi Academy*
## Video Solution 1 by SpreadTheMathLove
https://www.youtube.com/watch?v=-bARFv6Felw
## See Also
