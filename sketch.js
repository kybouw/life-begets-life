/* 
 * Life begets Life
 *
 * Copyright (c) Kyle Bouwman 2020-2021
 *
 */

function setup() {

  canvas_width = 200;
  canvas_height = 150;
  canvas_scale = 4;

  canvas_color = '#9DCC66';

  createCanvas(canvas_width * canvas_scale, canvas_height * canvas_scale);
  background(canvas_color);

  start = [canvas_width / 2, canvas_height];
  
  max_trees = 128;
  trees = 1;
  trees_leaves = [ [start.slice()] ];
  dead_trees = 0;
  dead_trees_leaves = [];
  
  pen_locs = [ [start.slice()] ];
  pen_histories = [ [start.slice()] ];
  
  
  /* conway's life */
  life_rows = max(max_trees, 16);
  life_cols = max(max_trees, 16);
  life_scale = 128 / life_rows;
  
  life_grid = get_random_life_grid();
  
  
  /* pause feature */
  running = 1;
  
}

function draw() {
  
  for(var dead_tree = 0; dead_tree < dead_trees; dead_tree++) {
    paint_no_leaf(dead_tree);
  }
  
  for(var tree = 0; tree < trees; tree++) {
    paint_leaf(tree);
  } // end for tree
  
  next();
  
  /* paint life grid */
  var next_life_grid = [];
  for(var row = 0; row < life_rows; row++) {
    
    var next_row = [];
    for(var col = 0; col < life_cols; col++) {
      
      // paint the current grid
      paint_life_pixel(row, col, life_grid[row][col]);
      // update the next grid
      next_row.push(next_cell(row, col));
    }
    
    next_life_grid.push(next_row.slice());
  }
  /* update next life */
  life_grid = next_life_grid.slice();
  
}

function paint_leaf(tree) {
  
  var x = pen_locs[tree][0];
  var y = pen_locs[tree][1];
  trees_leaves[tree].push([x, y]);
  
  for(var i = 0; i < canvas_scale; i++) {
    for(var j = 0; j < canvas_scale; j++) {
      stroke('black');
      point(x * canvas_scale + i, y * canvas_scale + j);
      stroke('#2D4F21');
      point((x - 1) * canvas_scale + i, y * canvas_scale + j);
    }
  }
  
}

function paint_no_leaf(dead_tree) {
  
  if(dead_trees_leaves[dead_tree].length < 1) {
    dead_trees--;
    dead_trees_leaves.splice(dead_tree, 1);
    return;
  }
  var curr_pos = dead_trees_leaves[dead_tree].pop();
  var x = curr_pos[0];
  var y = curr_pos[1];
  
  for(var i = 0; i < canvas_scale; i++) {
    for(var j = 0; j < canvas_scale; j++) {
      stroke(canvas_color);
      point(x * canvas_scale + i, y * canvas_scale + j);
      point((x - 1) * canvas_scale + i, y * canvas_scale + j);
    }
  }
  
}

function next() {
  var choice_factor = 5;
  
  for(var i = 0; i < trees; i++) {
    var next_move = get_life_row(i) % choice_factor;
    var living = get_life_col(i);
    
    if(living % 100000 === 0) {
      kill_tree(i);                      // trees can die
    }
    else {
      if(next_move < 1) {
        pop_spot(i);
      }
      else if(next_move < 2) {
        step_forward(i);
      }
      else if(next_move < 3) {
        step_left(i);
      }
      else if(next_move < 4) {
        step_right(i);
      }
      else {
        push_spot(i);
      }
      
    } // end live/die else
    
  } // end for tree
  
  /* create new trees */
  for(var i = trees; i < max_trees; i++) {
    var startx = get_life_col(i) % canvas_width;
    var starty = canvas_height;
    trees_leaves.push([[startx,starty]]);
    pen_locs.push([[startx,starty]]);
    pen_histories.push( [[startx,starty]] );
    trees++;
  }
  
}

function kill_tree(tree) {
  
  dead_trees++;
  dead_trees_leaves.push(trees_leaves[tree].slice());
  trees_leaves.splice(tree, 1)
  pen_locs.splice(tree, 1);
  trees--;
}

function step_forward(tree) {
  pen_locs[tree] = [pen_locs[tree][0], pen_locs[tree][1] - 1];

  if(pen_locs[tree][1] < 0) {
    pop_spot(tree);
  }

}

function step_left(tree) {
  pen_locs[tree] = [pen_locs[tree][0] - 1, pen_locs[tree][1]];

  if(pen_locs[tree][0] < 0) {
    pop_spot(tree);
  }

}

function step_right(tree) {
  pen_locs[tree] = [pen_locs[tree][0] + 1, pen_locs[tree][1]];

  if(pen_locs[tree][0] > canvas_width) {
    pop_spot(tree);
  }

}

function push_spot(tree) {
  pen_histories[tree].push( pen_locs[tree].slice() );
}

function pop_spot(tree) {
  if(pen_histories[tree].length > 0) {
    pen_locs[tree] = pen_histories[tree].pop();
  }

}

function get_random_life_grid() {
  var ret = [];
  for(var i = 0; i < life_rows; i++) {
    var row = [];
    for(var j = 0; j < life_cols; j++) {
      row.push( int(random() * 2));
    }
    ret.push(row);
  }
  return ret;
}

function next_cell(row, col) {
  
  /* game of life */
  var col_west = wrap(col - 1, life_cols);
  var col_east = wrap(col + 1, life_cols);
  var row_north = wrap(row - 1, life_rows);
  var row_south = wrap(row + 1, life_rows);
  
  var nw = life_grid[row_north][col_west];
  var tn = life_grid[row_north][col];
  var ne = life_grid[row_north][col_east];
  var tw = life_grid[row][col_west];
  var tc = life_grid[row][col];
  var te = life_grid[row][col_east];
  var sw = life_grid[row_south][col_west];
  var ts = life_grid[row_south][col];
  var se = life_grid[row_south][col_east];
  
  var live_neighbors = nw + tn + ne + tw + te + sw + ts + se;
  
  if(tc === 1) // if cell is alive
    return (live_neighbors < 2 || live_neighbors > 3) ? 0 : 1;           // normal conway
    // return (live_neighbors < 1 || live_neighbors > 3) ? 0 : 1;           // 2 is not lonely
    // return (live_neighbors < 5) ? 0 : 1;                                // symmetric
  else // if cell is not alive
    return (live_neighbors === 3) ? 1 : 0;                           // normal conway
    // return 1;                                                  // revive immediately
    // return (live_neighbors === 2) ? 1 : 0;                        // two n revive
    // return (live_neighbors < 5) ? 1 : 0;                                // symmetric
}

function wrap(index, wrap_limit) {
  if(index < 0) {
    return wrap(index + wrap_limit);
  }
  if(index >= wrap_limit) {
    return wrap(index - wrap_limit);
  }
  return index;
}

function paint_life_pixel(row, col, live) {
  if(live === 1) {
    stroke('white');
  }
  else {
    stroke('black');
  }
  
  for(var i = 0; i < life_scale; i++) {
    for(var j = 0; j < life_scale; j++) {
      point(col * life_scale + i, row * life_scale + j);
    }
  }
}

function get_life_row(row) {
  var sum = 0;
  for(var i = 0; i < life_cols; i++) {
    sum += life_grid[row][life_cols - i - 1] * (Math.pow(2, i));
  }
  return sum;
}

function get_life_col(col) {
  var sum = 0;
  for(var i = 0; i < life_rows; i++) {
    sum += life_grid[life_rows - i - 1][col] * (Math.pow(2, i));
  }
  return sum;
}

function keyPressed() {
  if(running === 1) {
    noLoop();
    running = 0;
  }
  else {
    loop();
    running = 1;
  }
}
