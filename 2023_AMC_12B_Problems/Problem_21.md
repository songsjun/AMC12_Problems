# 2023 AMC 12B Problem 21

## Problem
A lampshade is made in the form of the lateral surface of the frustum of a right circular cone. The height of the frustum is $3\sqrt3$ inches, its top diameter is 6 inches, and its bottom diameter is 12 inches. A bug is at the bottom of the lampshade and there is a glob of honey on the top edge of the lampshade at the spot farthest from the bug. The bug wants to crawl to the honey, but it must stay on the surface of the lampshade. What is the length in inches of its shortest path to the honey?

$\textbf{(A) } 6 + 3\pi\qquad \textbf{(B) }6 + 6\pi\qquad \textbf{(C) } 6\sqrt3 \qquad \textbf{(D) } 6\sqrt5 \qquad \textbf{(E) } 6\sqrt3 + \pi$
## Graph
> [Asymptote diagram - not rendered in Markdown]

```asy
// Please make the graph better if you have time. import olympiad; size(10cm); draw((-1,0)..(0,-1)..(1,0)); import olympiad; pair A = (-1,0); import olympiad; pair B = (-0.5,0); import olympiad; pair C = (0.5,0); import olympiad; pair D = (1,0), E = (0,0), F = (-0.25,-0.43301270189); draw(A--B); draw(C--D); draw((-0.5,0)..(0,-0.5)..(0.5,0)); draw(E--A); label("$12$",(-0.5,0.15)); draw(E--(0,-0.5)); label("$6$",(0.1,-0.25)); draw(A--F); draw(F--E); draw(anglemark(E,F,A), p=black); label("$\circ$", anglemark(E,F,A), NE);
```
## Solution
We augment the frustum to a circular cone.
Denote by O the apex of the cone.
Denote by A the bug and B the honey.

By using the numbers given in this problem, the height of the cone is 6 $\sqrt{3}.$
Thus, OA = 12 and OB = 6.

We unfold the lateral face. So we get a circular sector.
The radius is 12 and the length of the arc is $12\pi.$
Thus, the central angle of this circular sector is $180^\circ.$

Because A and B are opposite in the original frustum, in the unfolded circular cone, $\angle AOB = \frac{180^\circ}{2} = 90^\circ.$

Notice that a feasible path between A and B can only fall into the region with the range of radii between OB = 6 and OA = 12.
Therefore, we cannot directly connect A and B and must make a detour.
Denote by AC a tangent to the circular sector with radius 6 that meets it at point C.
Therefore, the shortest path between A and B consists of a segment AC and an arc from C to B.

Because OA = 12, OC = 6 and $\angle OCA = 90^\circ,$ we have AC = $\sqrt{OA^2 - OC^2} = 6 \sqrt{3}$ and $\angle AOC = 60^\circ.$
This implies $\angle COB = \angle AOB - \angle AOC = 30^\circ.$
Therefore, the length of the arc between C and B is OB $\cdot \pi \cdot \frac{\angle COB}{180^\circ} = \pi.$
Therefore, the shortest distance between A and B is $\boxed{\textbf{(E) } 6 \sqrt{3} + \pi}.$

*~Steven Chen (Professor Chen Education Palace, www.professorchenedu.com)*
## Video Solution
https://youtu.be/hBf_SVKK9tE

*~MC*
## Video Solution
https://youtu.be/43TAxlETKnA

*~Steven Chen (Professor Chen Education Palace, www.professorchenedu.com)*
## See Also
