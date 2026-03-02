# 2020 AMC 12A Problem 11

> This problem is the same as [2020 AMC 12A #11](https://artofproblemsolving.com/wiki/index.php/2020_AMC_12A_Problems) and [2020 AMC 10A #13](https://artofproblemsolving.com/wiki/index.php/2020_AMC_10A_Problems).
## Problem
A frog sitting at the point $(1, 2)$ begins a sequence of jumps, where each jump is parallel to one of the coordinate axes and has length $1$, and the direction of each jump (up, down, right, or left) is chosen independently at random. The sequence ends when the frog reaches a side of the square with vertices $(0,0), (0,4), (4,4),$ and $(4,0)$. What is the probability that the sequence of jumps ends on a vertical side of the square?

$\textbf{(A)}\ \frac12\qquad\textbf{(B)}\ \frac 58\qquad\textbf{(C)}\ \frac 23\qquad\textbf{(D)}\ \frac34\qquad\textbf{(E)}\ \frac 78$
## Solution 1
Drawing out the square, it's easy to see that if the frog goes to the left, it will immediately hit a vertical end of the square. Therefore, the probability of this happening is $\frac{1}{4} \cdot 1 = \frac{1}{4}$. If the frog goes to the right, it will be in the center of the square at $(2,2)$, and by symmetry (since the frog is equidistant from all sides of the square), the chance it will hit a vertical side of a square is $\frac{1}{2}$. The probability of this happening is $\frac{1}{4} \cdot \frac{1}{2} = \frac{1}{8}$.


If the frog goes either up or down, it will hit a line of symmetry along the corner it is closest to and furthest to, and again, is equidistant relating to the two closer sides and also equidistant relating the two further sides. The probability for it to hit a vertical wall is $\frac{1}{2}$. Because there's a $\frac{1}{2}$ chance of the frog going up or down, the total probability for this case is $\frac{1}{2} \cdot \frac{1}{2} = \frac{1}{4}$ and summing up all the cases, $\frac{1}{4} + \frac{1}{8} + \frac{1}{4} = \frac{5}{8}       \implies \boxed{\textbf{(B) } \frac{5}{8}}$.
## Solution 2
Let's say we have our five by five grid and we work this out by casework. A is where the frog is, while B and C are possible locations for his second jump, while O is everything else. If we land on a C, we have reached the vertical side. However, if we land on a B, the probability of landing on a C is 1/4, while B is 3/4. Since C means that we have "succeeded", while B means that we have a half chance, we compute $1 \cdot C + \frac{1}{2} \cdot B$.


$$1 \cdot \frac{1}{4} + \frac{1}{2} \cdot \frac{3}{4}$$


$$\frac{1}{4} + \frac{3}{8}$$


We get $\frac{5}{8}$, or $B$


$$\text{O}\ \ \ \text{O}\ \ \ \text{O}\ \ \ \text{O}\ \ \ \text{O}$$




$$\text{O}\ \ \ \text{B}\ \ \ \text{O}\ \ \ \text{O}\ \ \ \text{O}$$


$$\text{C}\ \ \ \text{A}\ \ \ \text{B}\ \ \ \text{O}\ \ \ \text{O}$$


$$\text{O}\ \ \ \text{B}\ \ \ \text{O}\ \ \ \text{O}\ \ \ \text{O}$$


$$\text{O}\ \ \ \text{O}\ \ \ \text{O}\ \ \ \text{O}\ \ \ \text{O}$$


*~yeskay*

~<B+ (minor alterations and edits)
## Solution 3
If the frog is on one of the 2 diagonals, the chance of landing on vertical or horizontal each becomes $\frac{1}{2}$. Since it starts on $(1,2)$, there is a $\frac{3}{4}$ chance (up, down, or right) it will reach a diagonal on the first jump and $\frac{1}{4}$ chance (left) it will reach the vertical side. The probablity of landing on a vertical is $\frac{1}{4}+\frac{3}{4} \cdot \frac{1}{2}=\boxed{\textbf{(B)} \frac{5}{8}}$.
- Lingjun
## Solution 4 (Complete States)
Let $P_{(x,y)}$ denote the probability of the frog's sequence of jumps ends with it hitting a vertical edge when it is at $(x,y)$. Note that $P_{(1,2)}=P_{(3,2)}$ by reflective symmetry over the line $x=2$. Similarly, $P_{(1,1)}=P_{(1,3)}=P_{(3,1)}=P_{(3,3)}$, and $P_{(2,1)}=P_{(2,3)}$.
Now we create equations for the probabilities at each of these points/states by considering the probability of going either up, down, left, or right from that point:


$$P_{(1,2)}=\frac{1}{4}+\frac{1}{2}P_{(1,1)}+\frac{1}{4}P_{(2,2)}$$


$$P_{(2,2)}=\frac{1}{2}P_{(1,2)}+\frac{1}{2}P_{(2,1)}$$


$$P_{(1,1)}=\frac{1}{4}+\frac{1}{4}P_{(1,2)}+\frac{1}{4}P_{(2,1)}$$


$$P_{(2,1)}=\frac{1}{2}P_{(1,1)}+\frac{1}{4}P_{(2,2)}$$


We have a system of $4$ equations in $4$ variables, so we can solve for each of these probabilities. Plugging the second equation into the fourth equation gives


$$P_{(2,1)}=\frac{1}{2}P_{(1,1)}+\frac{1}{4}\left(\frac{1}{2}P_{(1,2)}+\frac{1}{2}P_{(2,1)}\right)$$


$$P_{(2,1)}=\frac{8}{7}\left(\frac{1}{2}P_{(1,1)}+\frac{1}{8}P_{(1,2)}\right)=\frac{4}{7}P_{(1,1)}+\frac{1}{7}P_{(1,2)}$$


Plugging in the third equation into this gives


$$P_{(2,1)}=\frac{4}{7}\left(\frac{1}{4}+\frac{1}{4}P_{(1,2)}+\frac{1}{4}P_{(2,1)}\right)+\frac{1}{7}P_{(1,2)}$$


$$P_{(2,1)}=\frac{7}{6}\left(\frac{1}{7}+\frac{2}{7}P_{(1,2)}\right)=\frac{1}{6}+\frac{1}{3}P_{(1,2)}\text{    (*)}$$


Next, plugging in the second and third equation into the first equation yields


$$P_{(1,2)}=\frac{1}{4}+\frac{1}{2}\left(\frac{1}{4}+\frac{1}{4}P_{(1,2)}+\frac{1}{4}P_{(2,1)}\right)+\frac{1}{4}\left(\frac{1}{2}P_{(1,2)}+\frac{1}{2}P_{(2,1)}\right)$$


$$P_{(1,2)}=\frac{3}{8}+\frac{1}{4}P_{(1,2)}+\frac{1}{4}P_{(2,1)}$$


Now plugging in (*) into this, we get


$$P_{(1,2)}=\frac{3}{8}+\frac{1}{4}P_{(1,2)}+\frac{1}{4}\left(\frac{1}{6}+\frac{1}{3}P_{(1,2)}\right)$$


$$P_{(1,2)}=\frac{3}{2}\cdot\frac{5}{12}=\boxed{\textbf{(B) }\frac{5}{8}}$$


*~mathisawesome2169*

Note: We can also think of each state $P_{(x,y)}$ as the probability the frog will reach a vertical side given that it is $x$ away from a vertical side and $y$ away from a horizontal side. This is just another way to think about the reflective symmetry.
*~GardenRock10*
## Solution 5 (States)
this is basically another version of solution 4; shoutout to mathisawesome2169 :D

First, we note the different places the frog can go at certain locations in the square:

If the frog is at a border vertical point $((1,2),(3,2))$, it moves with probability $\frac{1}{4}$ to a vertical side of the square, probability $\frac{1}{4}$ to the center of the square, and probability $\frac{1}{2}$ to a corner square.

If the frog is at a border horizontal point $((2,1),(2,3))$, it moves with probability $\frac{1}{4}$ to a horizontal side of the square, probability $\frac{1}{4}$ to the center of the square, and probability $\frac{1}{2}$ to a corner square.

If the frog is at a center square $((2,2))$, it moves with probability $\frac{1}{2}$ to a border horizontal point and probability $\frac{1}{2}$ to a border vertical point.

If the frog is at a corner $((1,1),(1,3),(3,3),(3,1))$, it moves with probability $\frac{1}{4}$ to a vertical side of the square, probability $\frac{1}{4}$ to a horizontal side, probability $\frac{1}{4}$ to a border horizontal point, and probability $\frac{1}{4}$ to a border vertical point.

Now, let $x$ denote the probability of the frog reaching a vertical side when it is at a border vertical point. Similarly, let $y$ denote the probability of the frog reaching a vertical side when it is at a border horizontal point.
Now, the probability of the frog reaching a vertical side of the square at any location inside the square can be expressed in terms of $x$ and $y$.

First, the two easier ones: $P_{center}=\frac{1}{2}\frac{1}{2}y$, and $P_{corner}=\frac{1}{4}+\frac{1}{4}\frac{1}{4}y$.
Now, we can write $x$ and $y$ in terms of $x$ and $y$, allowing us to solve a system of two variables:


$$x=\frac{1}{4}+\frac{1}{4}P_{center}+\frac{1}{2}P_{corner}=\frac{1}{4}+\frac{1}{4}\left(\frac{1}{2}x+\frac{1}{2}y\right)+\frac{1}{2}\left(\frac{1}{4}+\frac{1}{4}x+\frac{1}{4}y\right)$$


and

$$y=\frac{1}{4}P_{center}+\frac{1}{2}P_{corner}=\frac{1}{4}\left(\frac{1}{2}x+\frac{1}{2}y\right)+\frac{1}{2}\left(\frac{1}{4}+\frac{1}{4}x+\frac{1}{4}y\right).$$


From these two equations, it is apparent that $y=x-\frac{1}{4}$. We can then substitute this value for $y$ back into any of the two equations above to get

$$x=\frac{1}{4}+\frac{1}{4}\left(\frac{1}{2}x+\frac{1}{2}\left(x-\frac{1}{4}\right)\right)+\frac{1}{2}\left(\frac{1}{4}+\frac{1}{4}x+\frac{1}{4}\left(x-\frac{1}{4}\right)\right).$$

 Although this certainly looks intimidating, we can expand the parentheses and multiply both sides by 16 to eliminate the fractions, which upon simplification yields the equation

$$16x=5+8x,$$

 giving us the desired probability $x=\frac{5}{8}$. The answer is then $\boxed{\textbf{(B) }\frac{5}{8}}$.

- curiousmind888 & TGSN
## Video Solutions
## Video Solution 1
[https://www.youtube.com/watch?v=ZGwAasE32Y4&t=280s IceMatrix's Solution (Starts at 4:40)]
## Video Solution 2 (Simple & Quick)
https://youtu.be/qNaN0BlIsw0
## Video Solution 3
On The Spot STEM

https://youtu.be/xGs7BjQbGYU
## Video Solution 4
https://youtu.be/0m4lbXSUV1I

*~savannahsolver*
## Video Solution 5
https://youtu.be/IRyWOZQMTV8?t=5173

*~pi_is_3.14*
## Video Solution 6
https://www.youtube.com/watch?v=R220vbM_my8

*~amritvignesh0719062.0*
## Video Solution 7
https://www.youtube.com/watch?v=TvYoiU_zct8


*~mathgenius2012*
## See Also
