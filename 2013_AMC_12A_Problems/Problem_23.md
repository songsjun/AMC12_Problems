# 2013 AMC 12A Problem 23

## Problem
 ABCD is a square of side length  $\sqrt{3} + 1$ . Point  P  is on  $\overline{AC}$  such that  AP = $\sqrt{2}$ . The square region bounded by  ABCD  is rotated  $90^{\circ}$  counterclockwise with center  P , sweeping out a region whose area is  $\frac{1}{c} (a \pi + b)$ , where a , b, and  c  are positive integers and  $\text{gcd}(a,b,c) = 1$ . What is  a + b + c ?

$\textbf{(A)} \ 15 \qquad \textbf{(B)} \ 17 \qquad \textbf{(C)} \ 19 \qquad \textbf{(D)} \ 21 \qquad \textbf{(E)} \ 23$
## Solution
We first note that diagonal  $\overline{AC}$  is of length  $\sqrt{6} + \sqrt{2}$ . It must be that  $\overline{AP}$  divides the diagonal into two segments in the ratio $\sqrt{3}$ to 1. It is not difficult to visualize that when the square is rotated, the initial and final squares overlap in a rectangular region of dimensions $2\sqrt{3}$ by $\sqrt{3} + 1.$ The area of the overall region (of the initial and final squares) is therefore twice the area of the original square minus the overlap, or  2 ($\sqrt{3} + 1)^2 - 2 (\sqrt{3} + 1) = 2 (4 + 2 \sqrt{3}) - 2 \sqrt{3} - 2 = 6 + 2 \sqrt{3}$ .

The area also includes 4 circular segments. Two are quarter-circles centered at P of radii $\sqrt{2} (t$he segment bounded by  $\overline{PA}$  and  $\overline{PA'})$ and $\sqrt{6} (t$hat bounded by $\overline{PC}$ and $\overline{PC'}).$ Assuming A is the bottom-left vertex and B is the bottom-right one, it is clear that the third segment is formed as B swings out to the right of the original square [recall that the square is rotated counterclockwise], while the fourth is formed when D overshoots the final square's left edge. To find these areas, consider the perpendicular from P to $\overline{BC}.$ Call the point of intersection E. From the previous paragraph, it is clear that PE = $\sqrt{3}$ and BE = 1. This means PB = 2, and B swings back inside edge $\overline{BC}$ at a point 1 unit above E (since it left the edge 1 unit below). The triangle of the circular sector is therefore an equilateral triangle of side length 2, and so the angle of the segment is $60^{\circ}$. Imagining the process in reverse, it is clear that the situation is the same with point D.

The area of the segments can be found by subtracting the area of the triangle from that of the sector; it follows that the two quarter-segments have areas  $\frac{1}{4} \pi (\sqrt{2})^2 - \frac{1}{2} \sqrt{2} \sqrt{2} = \frac{\pi}{2} - 1$  and  $\frac{1}{4} \pi (\sqrt{6})^2 - \frac{1}{2} \sqrt{6} \sqrt{6} = \frac{3 \pi}{2} - 3$ . The other two segments both have area $\frac{1}{6} \pi (2)^2 - \frac{(2)^2 \sqrt{3}}{4} = \frac{2 \pi}{3} - \sqrt{3}$ .

The total area is therefore (6 + 2 $\sqrt{3}) + (\frac{\pi}{2} - 1) + (\frac{3 \pi}{2} - 3) + 2 (\frac{2 \pi}{3} - \sqrt{3}) = 2 + 2 \sqrt{3} + 2 \pi + \frac{4 \pi}{3} - 2 \sqrt{3} = \frac{10 \pi}{3} + 2 = \frac{1}{3} (10 \pi + 6)$

Since $a = 10, b = 6$, and $c = 3$, the answer is a + b + $c = 10 + 6 + 3 =\boxed{\textbf{(C)} \ 19}.$
## Video Solution by Richard Rusczyk
https://artofproblemsolving.com/videos/amc/2013amc12a/362

*~dolphin7*
## See also
