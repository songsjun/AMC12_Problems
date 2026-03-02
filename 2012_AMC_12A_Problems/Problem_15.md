# 2012 AMC 12A Problem 15

> This problem is the same as [2012 AMC 12A #15](https://artofproblemsolving.com/wiki/index.php/2012_AMC_12A_Problems) and [2012 AMC 10A #20](https://artofproblemsolving.com/wiki/index.php/2012_AMC_10A_Problems).
## Problem
A $3 \times 3$ square is partitioned into $9$ unit squares. Each unit square is painted either white or black with each color being equally likely, chosen independently and at random. The square is then rotated $90\,^{\circ}$ clockwise about its center, and every white square in a position formerly occupied by a black square is painted black. The colors of all other squares are left unchanged. What is the probability the grid is now entirely black?

$\textbf{(A)}\ \frac{49}{512}\qquad\textbf{(B)}\ \frac{7}{64}\qquad\textbf{(C)}\ \frac{121}{1024}\qquad\textbf{(D)}\ \frac{81}{512}\qquad\textbf{(E)}\ \frac{9}{32}$
## Solution 1
First, look for invariants. The center, unaffected by rotation, must be black. So automatically, the chance is less than $\frac{1}{2}.$ Note that a $90^{\circ}$ rotation requires that black squares be across from each other across a vertical or horizontal axis.


As such, $2$ squares directly across from each other must be black in the $4$ edge squares. Since there are $2$ configurations for this to be possible (top and bottom, right and left), this is a chance of


$$\left (\frac{1}{2} \cdot \frac{1}{2} \right )+ \left (\frac{1}{2} \cdot \frac{1}{2} \right )=\frac{1}{2}$$




However, by [PIE](https://artofproblemsolving.com/wiki/index.php/PIE), subtract the chance all 4 are black and both configurations are met: $\frac{1}{2}- \left (\frac{1}{2} \cdot \frac{1}{2} \right ) \cdot \left (\frac{1}{2} \cdot \frac{1}{2} \right )=\frac{7}{16}$. Through symmetrical reasoning, the corners also have a $\frac{7}{16}$ chance of having a configuration that yields all black corners.

Then, the chance that all squares black is the intersection of all these probabilities: $\frac{1}{2} \left (\frac{7}{16} \right ) \left (\frac{7}{16} \right ) = \boxed{\textbf{(A)}\ \frac{49}{512}}$


*~BJHHar*

Also, if you have little to no time and are guessing, notice there are a total of $2^9 = 512$ ways to permutate the colors on the square (Each square can be white or black, so there are 2 possibilities for each of the 9 squares). Thus, the answer must be in some form of $\frac{\text{the number of good cases}}{\text{the total number of cases}}$, so E is not possible. Also, since the number of good cases must be an integer, C is not possible. From there, your chances of guessing the right answer are slightly higher. ~Extremelysupercooldude
## Solution 2
First, there is only one way for the middle square to be black because it is not affected by the rotation. Then we can consider the corners and edges separately. Let's first just consider the number of ways we can color the corners. There is $1$ case with all-black squares. There are four cases with one white square and all $4$ work. There are six cases with two white squares, but only the $2$ with the white squares diagonal from each other works. There are no cases with three white squares or four white squares. Then the total number of ways to color the corners is $1+4+2=7$. In essence, the edges work the same way, so there are also $7$ ways to color them. The number of ways to fit the conditions over the number of ways to color the squares is


$$\frac{7\times7}{2^9}=\boxed{\textbf{(A)}\ \frac{49}{512}}$$
## Solution 3
We proceed by casework.
Note that the middle square must be black because when rotated 90 degrees, it must keep its position. Now we have to deal with the following cases: <br>
Case 1: 0 white squares.
There is exactly $1$ way to color the grid this way. <br>
Case 2: 1 white square.
Note that the white square can be anywhere on the grid except for the middle square because when rotating 90 degrees it can never land on itself. Thus, there are $8$ cases.<br>
Case 3: 2 white squares.
We have $\binom{8}{2}=28$ ways to color two white squares without restrictions (the middle square must be black, giving us 8 squares to choose from). However, we must subtract the ways where two white squares differ by a rotation of 90 degrees about the middle of the square. There are a total of 8 cases we must subtract (these are not too hard to see). Thus, there are $20$ ways from this.<br>
Case 4: 3 white squares.
Since we can not change the middle square, there are $\binom{8}{3}=56$ ways to color this. However, we must consider the cases where at least two squares differ by a rotation of 90 degrees. We can count this with PIE: by the Principle of Exclusion, the number of cases we want to exclude is the number of cases where 2 squares differ by a rotation of 90 degrees and minus when there are 3 squares such that two of them differ by rotation of 90 and 1 of them differs by rotation of 180, because of the overcount from our first case.
From case 2, there are 8 causes such that two squares differ by a rotation of 90. There are also 6 other places we can place the third square (it can't be the middle of the two that we already colored), for a total of 48 ways. We have to subtract the second case. Note that there are 8 ways in which we can arrange two squares differing by 180 degrees. Out of these, each one has two ways to put another square such that two differ by 90 degrees and 1 pair differs by 180. However, this is overcounted by a factor of 2, so there are act/2=8 ways.
Thus, we have $56-(48-8)=16$ ways in this case.<br>
Case 5: 4 white squares.
Note that two of them have to be on one of the 4 corner squares, and two of them have to be on one of the 4 edge squares. Each solution yields two combinations, for a total of 2 * 2 = 4.
Adding up our cases yields $1+8+20+16+4=49$ ways. There are 512 ways to color the square without restrictions. Thus, the answer is $\boxed{\textbf{(A)}\ 49/512}$.
## Solution 4(Similar to Solution 2)
Number the squares in the original grid $1,2,3$ for the first row then $4,5,6$ for the second and lastly $7,8,9$ for the last. Essentially the grid should look like this:

1 2 3

4 5 6

7 8 9

Next, consider the numbering of the grid after a $90$ degree clockwise rotation about the center. This is pretty easy to visualize. The grid should end up looking like:

7 4 1

8 5 2

9 6 3

I define an orbit to be a cycle of the squares affected by the previous square's color. For instance, a corner orbit would be 1 - 7 - 9 - 3 - 1 because after the rotation, square $7$ is getting affected by square $1$'s position and we can reason for the others. Next, an edge orbit would be 2 - 4 - 8 - 6 - 2. We will first find the total number of colored orbits for a given corner orbit. The number of cases we will get for a corner orbit would be the same as the number of cases we will get for an edge orbit. We will multiply these cases together, and divide by the total number of configurations which is $2^{9} = 512$.
A corner orbit is 1 - 7 - 9 - 3 - 1. If square $1$ was originally colored black, then square $7$ has absolutely no restriction at all because it's transformed position is exactly where square $1$ was, which was colored black. If square $7$ was left colored white, then we can easily see that square $9$ then must be colored black. Finally, square $3$ has absolutely no restrictions at all. Let's assume it was colored white originally. Then one possible corner orbit would be B - W - B - B - B. In fact, in any given orbit, if two entries in an orbit are colored white, then the orbit wouldn't exist. This means that say we color both $7$ and $9$ white in a corner orbit. Then, the orbit wouldn't exist because the new grid would all be covered black there would still be some white squares. Bearing this in mind and checking if our hypothesis stands true, we can quickly list down the rest of the corner orbit cases:

B - W - B - B - B

B - W - B - W - B

B - B - W - B - B

B - B - B - W - B

B - B - B - B - B

W - B - W - B - W

W - B - B - B - B

As one can astutely notice, no "W" entries are sitting right next to each other! All of these orbits would actually work. Thus, we have a total of $7$ corner orbits. As we said before, because of the symmetry of a square, the edge orbits would function absolutely the same way as the corner orbits and thus we would also have $7$ edge orbits. To end with a full on black grid, we must combine a corner orbit with an edge orbit for a total of $7 \cdot 7 = 49$ cases. Thus the probability is $\frac{49}{512}$ which results to $\boxed{A}$.

Note: The $5$ square in the middle just stays the same even after the rotation so that is why it isn't included in any of the orbits.

*~ilikemath247365*
## Video Solution by Pi Academy
https://www.youtube.com/watch?v=uZqzC310jZM ~ Pi Academy
## See Also
