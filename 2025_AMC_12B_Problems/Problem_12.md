# 2025 AMC 12B Problem 12

## Problem
The windshield wiper on the driver's side of a large bus is depicted below.

> [Asymptote diagram - not rendered in Markdown]

```asy
/* Made by MRENTHUSIASM */ size(200); pair A, B, C, D; A = origin; B = (3/2,3*sqrt(3)/2); C = B+(0,1.75); D = B-(0,1.75); draw(A--B,linewidth(1.1)); draw(C--D,red+linewidth(2.1)); dot(A^^B,linewidth(5)); label("$A$",A,1.5*W); label("$B$",B,1.5*E); label("$C$",C,1.5*E); label("$D$",D,1.5*E);
```

Arm $\overline{AB}$ pivots back and forth around point A, sweeping out an arc of $60^{\circ}$, symmetric about the vertical line through A. The wiper blade $\overline{CD}$ is attached to B at its midpoint and stays vertical as the arm moves. The arm is 3 feet long, and the wiper blade is 3.5 feet tall. What is the area of the windshield cleaned by the wiper, in square feet, to the nearest hundredth? (Assume that the windshield is a flat vertical surface.)

$\textbf{(A) } 9.68 \qquad \textbf{(B) } 10.14 \qquad \textbf{(C) } 10.50 \qquad \textbf{(D) } 11.32 \qquad \textbf{(E) } 12.00$
## Diagram
> [Asymptote diagram - not rendered in Markdown]

```asy
/* Made by MRENTHUSIASM */ size(200); pair A, B, C, D, B1, C1, D1; A = origin; B = (3/2,3*sqrt(3)/2); C = B+(0,1.75); D = B-(0,1.75); B1 = (-B.x,B.y); C1 = (-C.x,C.y); D1 = (-D.x,D.y); fill(C--shift(0,1.75)*Arc(A,B,B1)--D1--shift(0,-1.75)*Arc(A,3,120,60)--cycle,palered); draw(A--B,linewidth(1.1)); draw(A--B1,dashed+linewidth(1.1)); draw(C--D,red+linewidth(2.1)); draw(C1--D1,red+dashed+linewidth(2.1)); draw(Arc(A,B,B1),dashed+linewidth(1.1),Arrows(12)); draw(shift(0,1.75)*Arc(A,B,B1),red+dashed+linewidth(2.1),Arrows(12)); draw(shift(0,-1.75)*Arc(A,B,B1),red+dashed+linewidth(2.1),Arrows(12)); dot(A^^B^^B1,linewidth(5)); label("$A$",A,1.5*W); label("$B$",B,1.5*E); label("$C$",C,1.5*E); label("$D$",D,1.5*E); label("$60^{\circ}$",A+(0,3),1.5*N); label("$3$",0.55*B,dir(-30)); Label L1 = Label("$3.5$", align=(0,0), position=MidPoint, filltype=Fill(3,3,white)); draw(C+(1,0)--D+(1,0), L=L1, arrow=Arrows(10),bar=Bars(15), linewidth(1.1));
```

*~MRENTHUSIASM*
## Solution 1 (Cavalieri's Principle)
The area cleaned by the wiper follows a thickened curve with vertical ends, where the curve is a $60^\circ$ arc with radius 3. Since the sides are vertical, by Cavalieri's Principle, the area is equivalent to a rectangle with side lengths 3.5 and the distance between the two vertical ends. Let B' be the result of point B at its leftmost point after it has swept $60^\circ.$ Then ABB' is equilateral so BB' = AB = 3. So the area is 3.5 $\cdot 3 = \boxed{\textbf{(C) } 10.50}.$

Note: if you aren't aware of Cavalieri's Principle, you can still recognize this by slicing the top curved part of the shape and moving it to the bottom, creating a rectangle with the same area as the original shape.
## Solution 2 (Calculus)
As solution 1 kind of explains, the top and bottom of the area swept out follow the exact same path shape, so we can think of the top one as f(x) and the bottom one as f(x)-3.5. As solution 1 points out, the width of the figure is 3. Then, the area between them is $\int_{0}^{3}$[f(x)-(f(x)-3.5)]$dx =\boxed{\textbf{(C) } 10.50}.$

*~dg6665*
## Video Solution 1 by SpreadTheMathLove
https://www.youtube.com/watch?v=39GPTtpMIqI
## See Also
